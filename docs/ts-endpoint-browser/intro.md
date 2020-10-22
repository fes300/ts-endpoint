---
id: intro
title: setup
sidebar_label: setting up `ts-endpoint-browser`
---

### install

```
$> yarn add ts-endpoint-browser
```

### peerDependencies

- "fp-ts": "^2.0.0",
- "io-ts": "^2.2.7"

### description

`ts-endpoint-browser` works in tandem with `ts-endpoint` in order to let you define endpoints just once for both client and server.
It provides a client for your endpoints using the browser's `fetch` API but it also exposes utilities to creaate you own implementation.
