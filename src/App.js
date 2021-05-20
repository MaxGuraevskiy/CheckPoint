import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import { message, Alert, Input, Button, Typography, Space, Table } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import ResizeObserver from "rc-resize-observer";
import classNames from "classnames";

import "./App.css";
import "antd/dist/antd.css";

const App = () => {
  const [loginValue, setLoginValue] = useState("");

  const [passwordValue, setPasswordValue] = useState("");

  const [jwt, setJwt] = useState();

  const [passes, setPasses] = useState([]);

  const getColor = (status) => {
    if (status === "Valid") {
      return "ghost";
    } else if (status === "Active") {
      return "primary";
    } else if (status === "Invalid") {
      return "dashed";
    } else return "danger";
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Button
          type={getColor(text)}
          onClick={() => ChangeStatus(record)}
          disabled={text === "Invalid"}
          // style={{ backgroundColor: getColor(text) }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Info",
      dataIndex: "info",
      key: "info",
    },
  ];

  const result2Pass = (result) => {
    result.map((d) => {
      setPasses((prevPasses) => [
        ...prevPasses,
        {
          status: d.status,
          pass_id: d.pass_id,
          type: d.type,
          info: d.first_content + " " + d.second_content,
          date: d.activation_date,
        },
      ]);
    });
  };

  const ChangeStatus = async (record) => {
    let newStatus = record.status;

    if (newStatus === "Invalid") return;
    if (newStatus === "Active") newStatus = "Invalid";
    if (newStatus === "Valid") newStatus = "Active";

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    var requestOptions = {
      method: "PUT",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(
      "https://checkpoint-server-db.herokuapp.com/api/checkpoint/" +
        record.pass_id +
        "?status=" +
        newStatus,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    refreshPasses();
  };

  //   date: "2021-05-21"
  // info: "first content second content"
  // pass_id: 26
  // status: "Valid"
  // type: "Car"

  const refreshPasses = () => {
    setPasses([]);
    if (jwt === undefined) {
      message.info(`Please Authenticate`);
    } else {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer " + jwt);

      var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      fetch(
        "https://checkpoint-server-db.herokuapp.com/api/checkpoint/1?page=0&size=100",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => result2Pass(result.result))
        .catch((error) => {
          console.log("error", error);
          setJwt("");
        });
    }
  };

  const appAuth = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      username: loginValue,
      password: passwordValue,
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    fetch(
      "https://checkpoint-server-db.herokuapp.com/auth/login",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setJwt(result.jwtToken);
      })
      .catch((error) => {
        console.log("error", error);
        setJwt("");
      });
  };

  return (
    <div style={styles.container}>
      <Typography>Checkpoint</Typography>
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={styles.inputs}>
          <div style={styles.input}>
            <Input
              placeholder="Login"
              onChange={(event) => setLoginValue(event.target.value)}
            />
          </div>
          <div style={styles.input}>
            <Input.Password
              placeholder="Password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              onChange={(event) => setPasswordValue(event.target.value)}
            />
          </div>
        </div>

        <div style={styles.SignInBtnView}>
          <Button type="primary" style={styles.signInBtn} onClick={appAuth}>
            Sign In
          </Button>
          <Alert
            message="JWT"
            description={jwt}
            style={{ display: "flex", flex: 1, maxWidth: "50%" }}
          />

          <Button
            type="dashed"
            style={styles.signInBtn}
            onClick={refreshPasses}
          >
            Refresh
          </Button>
        </div>
      </div>
      <div
        style={{
          marginTop: 30,
          display: "flex",
          flex: 1,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Table
          dataSource={passes}
          columns={columns}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 30,
  },
  inputs: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    paddingRight: 10,
    width: "50%",
  },
  input: {
    marginTop: 16,
    display: "flex",
    width: "30%",
  },
  SignInBtnView: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingLeft: 10,
    width: "50%",
  },
  signInBtn: {
    display: "flex",
    marginRight: 30,
    size: "large",
  },
};

export default App;
