import jetEnv, { num } from 'jet-env';
import tspo from 'tspo';

/******************************************************************************
                                 Constants
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

/******************************************************************************
                                 Setup
******************************************************************************/

const EnvVars = jetEnv({
  NodeEnv: (v) => tspo.isValue(NodeEnvs, v),
  Port: num,
  GithubApiToken: (v) => String(v),
});

/******************************************************************************
                            Export default
******************************************************************************/

export default EnvVars;
