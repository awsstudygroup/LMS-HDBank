import React, { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Form,
  SpaceBetween,
  Button,
  Container,
  Header,
  FormField,
  Input,
  Flashbar,
  Modal,
  Box,
  Icon,
} from "@cloudscape-design/components";

import { apiName, accessCodePath } from "../../utils/api";
import { API } from "aws-amplify";

const errorMess = "Access code of this information is existed"

function GenerateCode(props) {
  const [redirectToSale, setRedirectToSale] = useState(false);
  const [info, setInfo] = useState("");
  const [value, setValue] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const [codeOpen, setCodeOpen] = useState(false);
  const [flashItem, setFlashItem] = useState([]);
  const [generating, setGenerating] = useState(false);

  function makeRandomCode(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const generateCode = async () => {
    if ( !info.trim() || !value.trim() ){
      return;
    }

    setGenerating(true)
    // const firstCode = uuid();
    const firstCode = makeRandomCode(7);
    const encodedValue = btoa(value);
    let code = firstCode + "-" + encodedValue;

    // check info 
    try {
      const response = await API.get(apiName, accessCodePath + `?Info=${info}`);
      if (response) {
        setFlashItem([
          {
            type: "info",
            content: errorMess,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () => setFlashItem([]),
            id: "info_message",
          },
        ]);
        setGenerating(false)
        return;
      }
    }catch(error) {
      console.log(error);
      setGenerating(false)
      return;
    }

    const jsonData = {
      Info: info,
      AccessCode: code,
      Value: value,
    };
    try {
      const res = await API.put(apiName, accessCodePath, { body: jsonData });
      setAccessCode(code);
      setCodeOpen(true)
      setGenerating(false);
      // console.log(res);
    } catch (error) {
      console.log(error);
      setGenerating(false);
    }
  };

  return redirectToSale ? (
    <Navigate to={"/management/sale"} />
  ) : (
    <>
      <div className="dashboard-main">
        <div style={{marginBottom: "10px"}}>
          <Flashbar items={flashItem} />
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button formAction="none" variant="link" onClick={() => setRedirectToSale(true)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={generateCode} loading={generating}>
                  Generate
                </Button>
              </SpaceBetween>
            }
          >
            <Container
              header={<Header variant="h2">Generate Access Code</Header>}
            >
              <SpaceBetween direction="vertical" size="l">
                <FormField description="Enter url or email of user" label="Opportunity Information">
                  <Input
                    value={info}
                    onChange={(event) => setInfo(event.detail.value)}
                  />
                </FormField>
                <FormField label="Value">
                  <Input
                    value={value}
                    onChange={(event) => setValue(event.detail.value)}
                  />
                </FormField>
              </SpaceBetween>
            </Container>
          </Form>
        </form>
        <Modal
          onDismiss={() => setCodeOpen(false )}
          visible={codeOpen}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="primary"
                  onClick={() => setCodeOpen(false)}
                >
                  Ok
                </Button>
              </SpaceBetween>
            </Box>
          }
          header="Access code"
        >
          <div>
          <Button
            variant="link"
            onClick={() => {
              navigator.clipboard.writeText(accessCode);
            }}
          >
            <Icon name="copy" />
          </Button>
            {accessCode}
          </div>
        </Modal>
      </div>
    </>
  );
}

export default GenerateCode;
