import https from 'https';

type JsonObject = Record<string, unknown>;

export interface GithubRepository {
    name: string;
    owner: {
        login: string;
    };
}

export interface DependencyGraphResult {
    repository: string;
    manifests?: unknown;
    error?: string;
}

export class GithubApiError extends Error {
    public readonly statusCode: number;

    public constructor(message: string, statusCode = 502) {
        super(message);
        this.name = 'GithubApiError';
        this.statusCode = statusCode;
    }
}

function requestJson<T>(
    url: string,
    token: string,
    options: { method?: string; body?: JsonObject } = {},
): Promise<T> {
    return new Promise((resolve, reject) => {
        const request = https.request(
            url,
            {
                method: options.method ?? 'GET',
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'okaeshi-backend',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            },
            (response) => {
                let responseBody = '';

                response.setEncoding('utf8');
                response.on('data', (chunk: string) => {
                    responseBody += chunk;
                });
                response.on('end', () => {
                    const statusCode = response.statusCode ?? 502;
                    let responseData: unknown;

                    try {
                        responseData = JSON.parse(responseBody);
                    } catch {
                        reject(new GithubApiError('GitHub returned an invalid response.'));
                        return;
                    }

                    if (statusCode < 200 || statusCode >= 300) {
                        const message =
                            typeof responseData === 'object' &&
                                responseData !== null &&
                                'message' in responseData &&
                                typeof responseData.message === 'string'
                                ? responseData.message
                                : 'GitHub request failed.';
                        reject(new GithubApiError(message, statusCode));
                        return;
                    }

                    resolve(responseData as T);
                });
            },
        );

        request.on('error', () => {
            reject(new GithubApiError('Unable to reach GitHub.'));
        });

        if (options.body) {
            request.write(JSON.stringify(options.body));
        }
        request.end();
    });
}

export function getGithubUser(username: string, token: string): Promise<unknown> {
    return requestJson(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
        token,
    );
}

export async function getGithubRepositories(
    username: string,
    token: string,
): Promise<GithubRepository[]> {
    const repositories: GithubRepository[] = [];
    let page = 1;

    while (true) {
        const pageRepositories = await requestJson<GithubRepository[]>(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}`,
            token,
        );
        repositories.push(...pageRepositories);

        if (pageRepositories.length < 100) {
            return repositories;
        }
        page += 1;
    }
}

export async function getDependencyGraphManifests(
    repository: GithubRepository,
    token: string,
): Promise<unknown> {
    const response = await requestJson<{
        data?: {
            repository?: {
                dependencyGraphManifests?: {
                    nodes?: unknown[];
                };
            };
        };
        errors?: { message?: string }[];
    }>('https://api.github.com/graphql', token, {
        method: 'POST',
        body: {
            query: `
        query DependencyGraphManifests($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    dependencyGraphManifests(first: 100) {
      nodes {
        filename

        dependencies(first: 100) {
          nodes {
            packageName
            requirements
            packageManager
            relationship
            packageUrl

            repository {
              nameWithOwner
              url
            }
          }
        }
      }
    }
  }
}
      `,
            variables: {
                owner: repository.owner.login,
                name: repository.name,
            },
        },
    });

    if (response.errors?.length) {
        throw new GithubApiError(response.errors[0].message ?? 'GitHub GraphQL request failed.');
    }

    return response.data?.repository?.dependencyGraphManifests?.nodes ?? [];
}

export async function getDependencyGraphs(
    repositories: GithubRepository[],
    token: string,
): Promise<DependencyGraphResult[]> {
    return Promise.all(
        repositories.map(async (repository) => {
            try {
                return {
                    repository: repository.name,
                    manifests: await getDependencyGraphManifests(repository, token),
                };
            } catch (error) {
                return {
                    repository: repository.name,
                    error: error instanceof Error ? error.message : 'Dependency graph request failed.',
                };
            }
        }),
    );
}