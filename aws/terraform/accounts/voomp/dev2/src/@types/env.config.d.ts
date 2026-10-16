export interface EnvConfig {
  request: {
    body?: { [key: string]: any },
    url: string,
    token: {
      name: string,
      secret: string,
    },
  }

  stage: 'dev' | 'hml' | 'prd'
}
