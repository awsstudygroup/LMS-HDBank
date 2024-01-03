import React, { useState, useEffect } from "react";
import loadingGif from "../../assets/images/loading.gif";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { apiName, fqasPath } from "../../utils/api";
import { API } from 'aws-amplify';

export default function Help(props) {
  const [loading, setLoading] = useState();
  const [question, setQuestion] = useState([]);

  useEffect(() => {
    setLoading(true)
    API.get(apiName, fqasPath).then((data) => {
        setQuestion(data);
        setLoading(false);
    }).catch((error) => {
        console.log(error);
        setLoading(false);
    })
  }, [])

  return (
    <div>
      <NavBar navigation={props.navigation} href="/mylearning" />
      <div className="mylearning-wrapper">
        {loading ? (
          <div className="mylearning-main-container-loading">
            <img
              src={loadingGif}
              alt="loading..."
              className="mylearning-loading-gif-parent"
            />
          </div>
        ) : (
          <div className="mylearning-main-container">
            {!question ? (
              ""
            ) : (
              <div>
                <p className="mylearning-courses-header">Frequently asked questions</p>
                <div className="mylearning-courses-header-decor" />
                <div>
                  {question.map((item, index) => {
                    return <>
                      <strong>Q: {item.ques}</strong>
                      <p>{item.answer}</p>
                    </>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
