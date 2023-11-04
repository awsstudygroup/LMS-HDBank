import React from "react";
import "./Footer.css";
import { API } from "aws-amplify";
import { apiName, configUI } from "../../utils/api";
import { uiConfigId } from "../../utils/uiConfig";

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uiSet: null,
    };
  }

  loadUISet = () => {
    API.get(apiName, configUI + uiConfigId)
      .then((data) => {
        this.setState({ uiSet: data });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    let localParams = localStorage.getItem("AWSLIBVN_UISET");
    // console.log(localParams)
    if (localParams) {
      this.setState({ uiSet: JSON.parse(localParams) });
    } else {
      this.loadUISet();
    }
  }
  render() {
    return (
      <div className="footer">
        {this.state.uiSet && this.state.uiSet.Footer ? (
          <>
            <div className="footer-div footer-div-left">
              {this.state.uiSet.Footer.Left ? (
                <></>
              ) : (
                this.state.uiSet.Footer.Left.map((item) => {
                    <a href="#">item</a>
                })
              )}
            </div>
            <div className="footer-div footer-div-right">
            {this.state.uiSet.Footer.Right ? (
                <></>
              ) : (
                this.state.uiSet.Footer.Right.map((item) => {
                    <a href="#">item</a>
                })
              )}
            </div>
          </>
        ) : (
          <>
            <div className="footer-div footer-div-left">
              <a href="/">Feedback</a>
            </div>
            <div className="footer-div footer-div-right">
              <span>©2022, Amazon Web Services, Inc. or its affilites</span>
              <a href="/">Privacy</a>
              <a href="/">Term</a>
              <a href="/">Cookies preferences</a>
            </div>
          </>
        )}
      </div>
    );
  }
}
