import * as React from "react";
import { apiClient } from "./api";
import * as E from "fp-ts/Either";
import { InferFetchResult } from "ts-endpoint-browser";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/pipeable";

type APIResult = InferFetchResult<typeof apiClient.getUser>;
type Meta = { message: string };

const App: React.FC = () => {
  const [userID, setUserID] = React.useState<O.Option<number>>(O.none);
  const [loading, setLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState<
    O.Option<string>
  >(O.none);
  const [response, setResponse] = React.useState<O.Option<APIResult>>(O.none);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        width: "80%",
        margin: "auto",
      }}
    >
      <h2 style={{ textAlign: "center", marginTop: "80px" }}>
        ts-endpoint hello world
      </h2>
      <span style={{ marginBottom: "40px" }}>
        This app displays the a very basic usage for the{" "}
        <a href="https://www.npmjs.com/package/ts-endpoint">ts-endpoint</a>{" "}
        package. Try fetching user data (only users 1 and 2 are in DB).
      </span>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "15px" }}>
          <input
            placeholder="user ID"
            style={{ marginRight: "5px" }}
            type="number"
            value={O.isNone(userID) ? "" : userID.value}
            onChange={(e) =>
              setUserID(
                e.target.value === ""
                  ? O.none
                  : O.some(parseInt(e.target.value, 10))
              )
            }
          />

          <button
            disabled={loading}
            onClick={() => {
              pipe(
                userID,
                O.fold(
                  () =>
                    setValidationError(
                      O.some("you must set a userID to fetch data!")
                    ),
                  (ID) => {
                    setValidationError(O.none);
                    setLoading(true);
                    apiClient
                      .getUser({ Params: { id: ID } })()
                      .then((response) => {
                        console.log(111, response);

                        setResponse(O.some(response));
                        setLoading(false);
                      });
                  }
                )
              );
            }}
          >
            {loading ? "loading...." : "get data!"}
          </button>
        </div>

        {O.isSome(validationError) ? (
          <span style={{ color: "red" }}>{validationError.value}</span>
        ) : null}
      </div>

      <div style={{ height: "100%" }}>
        <h3 style={{ textAlign: "center" }}>Response:</h3>
        {pipe(
          response,
          O.fold(
            () => <span>there is no data to show yet!</span>,
            E.fold(
              (error) => {
                return (
                <div>{`There was a problem fetching data: ${
                  error.details.kind === "DecodingError"
                    ? error.message
                    : error.message
                }`}</div>
              )},
              (result) => (
                <>
                  <div
                    style={{ marginBottom: "40px" }}
                  >{`you successfully fetched ${result.user.name}'s data!`}</div>
                  <div>
                    <div>
                      <strong>name: </strong>
                      {result.user.name}
                    </div>
                    <div>
                      <strong>age: </strong>
                      {result.user.age}
                    </div>
                    <div>
                      <strong>surname: </strong>
                      {result.user.surname}
                    </div>
                  </div>
                </>
              )
            )
          )
        )}
      </div>
    </div>
  );
};

export default App;
