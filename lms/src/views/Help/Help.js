import React, { useState, useEffect } from "react";
import loadingGif from "../../assets/images/loading.gif";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { apiName, fqasPath } from "../../utils/api";
import { API } from 'aws-amplify';

export default function Help(props) {
  const [loading, setLoading] = useState();
  const [question, setQuestion] = useState([
    // {
    //   ques: "What is Amazon EC2 Auto Scaling?",
    //   answer:
    //     "Amazon EC2 Auto Scaling is a fully managed service designed to launch or terminate Amazon EC2 instances automatically to help ensure you have the correct number of Amazon EC2 instances available to handle the load for your application. Amazon EC2 Auto Scaling helps you maintain application availability through fleet management for EC2 instances, which detects and replaces unhealthy instances, and by scaling your Amazon EC2 capacity up or down automatically according to conditions you define. You can use Amazon EC2 Auto Scaling to automatically increase the number of Amazon EC2 instances during demand spikes to maintain performance and decrease capacity during lulls to reduce costs.",
    // },
    // {
    //     ques: "What is Amazon EC2 Auto Scaling?",
    //     answer:
    //       "Amazon EC2 Auto Scaling is a fully managed service designed to launch or terminate Amazon EC2 instances automatically to help ensure you have the correct number of Amazon EC2 instances available to handle the load for your application. Amazon EC2 Auto Scaling helps you maintain application availability through fleet management for EC2 instances, which detects and replaces unhealthy instances, and by scaling your Amazon EC2 capacity up or down automatically according to conditions you define. You can use Amazon EC2 Auto Scaling to automatically increase the number of Amazon EC2 instances during demand spikes to maintain performance and decrease capacity during lulls to reduce costs.",
    //   },
  ]);

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
                <p className="mylearning-courses-header">Câu hỏi thường gặp</p>
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
