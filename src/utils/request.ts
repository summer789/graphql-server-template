import axios from 'axios';
import * as tough from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();
const defaultOptions = {
  jar: cookieJar,
  withCredentials: true,
};

interface IOptions {
  host: string;
}

class Request {
  private options: IOptions;
  constructor(options: IOptions) {
    this.options = options;
  }

  register = (e: string, p: string) => {
    return axios.post(
      this.options.host,
      {
        query: `
        mutation {
          register(email:"${e}", password:"${p}") {
            path
            message
          }
        }
        `,
      },
      defaultOptions,
    );
  };

  login = (e: string, p: string) => {
    return axios.post(
      this.options.host,
      {
        query: `
        mutation {
          login(email: "${e}", password: "${p}") {
            path
            message
          }
        }
        `,
      },
      defaultOptions,
    );
  };

  logout = () => {
    return axios.post(
      this.options.host,
      {
        query: `
        mutation {
          logout
        }
        `,
      },
      {
        jar: cookieJar,
        withCredentials: true,
      },
    );
  };

  getUser = () => {
    return axios.post(
      this.options.host,
      {
        query: `
        {
          user {
            id
            email
          }
        }
        `,
      },
      defaultOptions,
    );
  };
}

export default new Request({ host: process.env.TEST_HOST });
