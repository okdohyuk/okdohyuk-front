export type HttpStatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export type HttpStatusEntry = {
  code: number;
  title: string;
  description: string;
  category: HttpStatusCategory;
};

export const HTTP_STATUS_DATA: HttpStatusEntry[] = [
  {
    code: 100,
    title: 'Continue',
    description: 'The server has received the request headers and the client should proceed.',
    category: '1xx',
  },
  {
    code: 101,
    title: 'Switching Protocols',
    description: 'The requester has asked to switch protocols and the server agreed.',
    category: '1xx',
  },
  {
    code: 102,
    title: 'Processing',
    description: 'The server has accepted the request and is processing it.',
    category: '1xx',
  },
  {
    code: 103,
    title: 'Early Hints',
    description: 'Used to return some response headers before final response.',
    category: '1xx',
  },
  {
    code: 200,
    title: 'OK',
    description: 'The request has succeeded.',
    category: '2xx',
  },
  {
    code: 201,
    title: 'Created',
    description: 'The request has been fulfilled and a new resource has been created.',
    category: '2xx',
  },
  {
    code: 202,
    title: 'Accepted',
    description: 'The request has been accepted for processing, but not completed.',
    category: '2xx',
  },
  {
    code: 203,
    title: 'Non-Authoritative Information',
    description: 'The request succeeded but the response is from a transforming proxy.',
    category: '2xx',
  },
  {
    code: 204,
    title: 'No Content',
    description: 'The server successfully processed the request and returns no content.',
    category: '2xx',
  },
  {
    code: 205,
    title: 'Reset Content',
    description: 'The client should reset the document view.',
    category: '2xx',
  },
  {
    code: 206,
    title: 'Partial Content',
    description: 'The server is delivering only part of the resource.',
    category: '2xx',
  },
  {
    code: 207,
    title: 'Multi-Status',
    description: 'Multiple status codes might be appropriate for different operations.',
    category: '2xx',
  },
  {
    code: 208,
    title: 'Already Reported',
    description: 'Members of a DAV binding have already been enumerated.',
    category: '2xx',
  },
  {
    code: 226,
    title: 'IM Used',
    description:
      'The server fulfilled a GET request and the response is a result of one or more instance manipulations.',
    category: '2xx',
  },
  {
    code: 300,
    title: 'Multiple Choices',
    description: 'The request has more than one possible response.',
    category: '3xx',
  },
  {
    code: 301,
    title: 'Moved Permanently',
    description: 'The URL of the requested resource has been changed permanently.',
    category: '3xx',
  },
  {
    code: 302,
    title: 'Found',
    description: 'The requested resource resides temporarily under a different URI.',
    category: '3xx',
  },
  {
    code: 303,
    title: 'See Other',
    description: 'The response to the request can be found at another URI using GET.',
    category: '3xx',
  },
  {
    code: 304,
    title: 'Not Modified',
    description: 'Indicates that the resource has not been modified since last requested.',
    category: '3xx',
  },
  {
    code: 305,
    title: 'Use Proxy',
    description: 'The requested resource must be accessed through a proxy.',
    category: '3xx',
  },
  {
    code: 307,
    title: 'Temporary Redirect',
    description:
      'The request should be repeated with another URI, but future requests should use the original URI.',
    category: '3xx',
  },
  {
    code: 308,
    title: 'Permanent Redirect',
    description: 'The request and all future requests should be repeated using another URI.',
    category: '3xx',
  },
  {
    code: 400,
    title: 'Bad Request',
    description: 'The server could not understand the request due to invalid syntax.',
    category: '4xx',
  },
  {
    code: 401,
    title: 'Unauthorized',
    description: 'Authentication is required to access the resource.',
    category: '4xx',
  },
  {
    code: 402,
    title: 'Payment Required',
    description: 'Reserved for future use.',
    category: '4xx',
  },
  {
    code: 403,
    title: 'Forbidden',
    description: 'The client does not have access rights to the content.',
    category: '4xx',
  },
  {
    code: 404,
    title: 'Not Found',
    description: 'The server can not find the requested resource.',
    category: '4xx',
  },
  {
    code: 405,
    title: 'Method Not Allowed',
    description: 'The request method is known but not supported by the target resource.',
    category: '4xx',
  },
  {
    code: 406,
    title: 'Not Acceptable',
    description: 'The server cannot produce a response matching the list of acceptable values.',
    category: '4xx',
  },
  {
    code: 407,
    title: 'Proxy Authentication Required',
    description: 'Authentication is required to access the proxy.',
    category: '4xx',
  },
  {
    code: 408,
    title: 'Request Timeout',
    description: 'The server timed out waiting for the request.',
    category: '4xx',
  },
  {
    code: 409,
    title: 'Conflict',
    description: 'The request conflicts with the current state of the resource.',
    category: '4xx',
  },
  {
    code: 410,
    title: 'Gone',
    description: 'The requested content has been permanently deleted from the server.',
    category: '4xx',
  },
  {
    code: 411,
    title: 'Length Required',
    description: 'The server refuses to accept the request without a defined Content-Length.',
    category: '4xx',
  },
  {
    code: 412,
    title: 'Precondition Failed',
    description: 'The client has indicated preconditions that the server does not meet.',
    category: '4xx',
  },
  {
    code: 413,
    title: 'Payload Too Large',
    description: 'The request entity is larger than limits defined by server.',
    category: '4xx',
  },
  {
    code: 414,
    title: 'URI Too Long',
    description:
      'The URI requested by the client is longer than the server is willing to interpret.',
    category: '4xx',
  },
  {
    code: 415,
    title: 'Unsupported Media Type',
    description: 'The media format of the requested data is not supported by the server.',
    category: '4xx',
  },
  {
    code: 416,
    title: 'Range Not Satisfiable',
    description: 'The range specified by the Range header cannot be fulfilled.',
    category: '4xx',
  },
  {
    code: 417,
    title: 'Expectation Failed',
    description: 'The expectation indicated by the Expect header cannot be met.',
    category: '4xx',
  },
  {
    code: 418,
    title: "I'm a teapot",
    description: 'The server refuses the attempt to brew coffee with a teapot.',
    category: '4xx',
  },
  {
    code: 421,
    title: 'Misdirected Request',
    description: 'The request was directed at a server that is not able to produce a response.',
    category: '4xx',
  },
  {
    code: 422,
    title: 'Unprocessable Entity',
    description: 'The request is well-formed but unable to be followed due to semantic errors.',
    category: '4xx',
  },
  {
    code: 423,
    title: 'Locked',
    description: 'The resource that is being accessed is locked.',
    category: '4xx',
  },
  {
    code: 424,
    title: 'Failed Dependency',
    description: 'The request failed due to failure of a previous request.',
    category: '4xx',
  },
  {
    code: 425,
    title: 'Too Early',
    description: 'The server is unwilling to risk processing a request that might be replayed.',
    category: '4xx',
  },
  {
    code: 426,
    title: 'Upgrade Required',
    description: 'The server refuses to perform the request using the current protocol.',
    category: '4xx',
  },
  {
    code: 428,
    title: 'Precondition Required',
    description: 'The origin server requires the request to be conditional.',
    category: '4xx',
  },
  {
    code: 429,
    title: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time.',
    category: '4xx',
  },
  {
    code: 431,
    title: 'Request Header Fields Too Large',
    description:
      'The server refuses to process the request because the header fields are too large.',
    category: '4xx',
  },
  {
    code: 451,
    title: 'Unavailable For Legal Reasons',
    description: 'The user requested a resource that is unavailable for legal reasons.',
    category: '4xx',
  },
  {
    code: 500,
    title: 'Internal Server Error',
    description: 'The server has encountered a situation it does not know how to handle.',
    category: '5xx',
  },
  {
    code: 501,
    title: 'Not Implemented',
    description: 'The request method is not supported by the server and cannot be handled.',
    category: '5xx',
  },
  {
    code: 502,
    title: 'Bad Gateway',
    description: 'The server received an invalid response from the upstream server.',
    category: '5xx',
  },
  {
    code: 503,
    title: 'Service Unavailable',
    description: 'The server is not ready to handle the request.',
    category: '5xx',
  },
  {
    code: 504,
    title: 'Gateway Timeout',
    description: 'The server did not get a response in time.',
    category: '5xx',
  },
  {
    code: 505,
    title: 'HTTP Version Not Supported',
    description: 'The HTTP version used in the request is not supported by the server.',
    category: '5xx',
  },
  {
    code: 506,
    title: 'Variant Also Negotiates',
    description:
      'The server has an internal configuration error with transparent content negotiation.',
    category: '5xx',
  },
  {
    code: 507,
    title: 'Insufficient Storage',
    description: 'The server is unable to store the representation needed to complete the request.',
    category: '5xx',
  },
  {
    code: 508,
    title: 'Loop Detected',
    description: 'The server detected an infinite loop while processing the request.',
    category: '5xx',
  },
  {
    code: 510,
    title: 'Not Extended',
    description: 'Further extensions to the request are required for the server to fulfill it.',
    category: '5xx',
  },
  {
    code: 511,
    title: 'Network Authentication Required',
    description: 'The client needs to authenticate to gain network access.',
    category: '5xx',
  },
];
