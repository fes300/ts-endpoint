# hello world app with ts-endpoint

this is a sample repository to illustrate how ts-endpoint works, it is composed of two small applicatives and a shared library where our endpoint definitions live:

- `client`: (very) simple client app using `ts-endpoint`
- `server`: (very) simple server app using `ts-endpoint` and `ts-endpoint-express`
- `shared`: (very) simple library containing our endpoints and `io-ts` models

## start the project

### setup

First of all install all the dependencies with `pnpm i`, then start a proxy server on port 1337 with `npx corsproxy`.

> **N.B.** be careful that you must not have a `node_modules` folder higher up in the directory chain to avoid clashes (this means that if you already installed the root folder dependencies you must first delete the root level `node_modules`):

### run it

To start the server just run the following commands from the root folder:

```sh
pnpm server start
```

then run the client:

```sh
pnpm client start
```

now go to http://localhost:8080 and you should have your (very) simple web app up and running.
