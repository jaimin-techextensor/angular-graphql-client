import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { setContext } from 'apollo-link-context';
import * as CryptoJS from "crypto-js";
// import * as JWT from "jsonwebtoken";
import { environment } from '../environments/environment';

export const query = gql`
{
  project(projectId: 47489751) {
    projectData(start: 1650825000, end: 1650997800, interval: AUTO, groupBy: [COUNTRY, REGION, SDK_TYPE, BROWSER]) {
      interval
      resources {
        country
        region
        sdkType
        browser
        intervalStart
        intervalEnd
        usage {
          hdArchiveComposedMinutes
          hdBroadcastComposedMinutes
          hlsMinutes
          individualArchiveMinutes
          sdArchiveComposedMinutes
          sdBroadcastComposedMinutes
          sipUserMinutes
          streamedPublishedMinutes
          streamedSubscribedMinutes
        }
        quality {
          publisher {
            latencyDistribution {
              ms50
              ms100
              ms200
              ms300
              ms400
              ms500
              ms600
              ms700
              ms800
              ms900
              ms1000
              ms1000Plus
            }
            videoBitrateDistribution {
              kbps100
              kbps200
              kbps300
              kbps400
              kbps500
              kbps600
              kbps700
              kbps800
              kbps900
              kbps1000
              kbps1200
              kbps1400
              kbps1600
              kbps1800
              kbps2000
              kbps2250
              kbps2500
              kbps2750
              kbps3000
              kbps3000Plus
            }
          }
          subscriber {
            latencyDistribution {
              ms50
              ms100
              ms200
              ms300
              ms400
              ms500
              ms600
              ms700
              ms800
              ms900
              ms1000
              ms1000Plus
            }
            videoBitrateDistribution {
              kbps100
              kbps200
              kbps300
              kbps400
              kbps500
              kbps600
              kbps700
              kbps800
              kbps900
              kbps1000
              kbps1200
              kbps1400
              kbps1600
              kbps1800
              kbps2000
              kbps2250
              kbps2500
              kbps2750
              kbps3000
              kbps3000Plus
            }
          }
        }
        errors {
          connect {
            attempts
            failures
          }
          publish {
            attempts
            failures
          }
          subscribe {
            attempts
            failures
          }
        }
      }
    }
  }
}

`;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  INSIGHTS_URL = 'https://insights.opentok.com';

  constructor(private apollo: Apollo) {
    const date: any = new Date();
    const currentTime = Math.floor(date / 1000);
    const payload = {
      iss: environment.api_key,
      ist: "project",
      iat: currentTime,
      exp: currentTime + (60 * 60) // 1 hour
    };

    const getHeaders = () => {
      // const token = JWT.sign(payload, 'c73db71f8f86c5ac5c41540cc771c2d60c249943');
      const headers = {
        "X-OPENTOK-AUTH": this.signToken(payload)
      };
      return headers;
    };


    const authMiddleware = setContext((_, { headers }) => {
      const authHeaders = getHeaders();
      // return the headers to the context so httpLink can read them
      return {
        headers: authHeaders
      };
    });

    apollo.create({
      link: authMiddleware.concat(
        new HttpLink({
          uri: 'https://insights.opentok.com/graphql',
        })
      ),
      cache: new InMemoryCache(),
    })
  }

  public projects = () => {
    this.apollo.query({
      query: query,
      fetchPolicy: 'no-cache'
    }).subscribe(result => {
      return result;
    })
  }

  private base64url(source: any) {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);

    encodedSource = encodedSource.replace(/=+$/, '');

    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
  }

  private encodeToken(payload: any) {
    var header = {
      "alg": "HS256",
      "typ": "JWT"
    };

    var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    var encodedHeader = this.base64url(stringifiedHeader);

    var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    var encodedData = this.base64url(stringifiedData);

    return encodedHeader + "." + encodedData;
  }

  private signToken(payload: any) {
    var secret = environment.client_secret;
    let token: any = this.encodeToken(payload);

    var signature: any = CryptoJS.HmacSHA256(token, secret);
    signature = this.base64url(signature);

    var signedToken = token + "." + signature;
    return signedToken;
  }
}
