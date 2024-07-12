import React from 'react';
import './Cert.css';
import { API, Auth, Storage } from 'aws-amplify';
import { Navigate } from "react-router-dom";
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import certBase from "../../assets/images/cert.png"
import { transformDateTime, getUISet, calcTimeBrief } from "../../utils/tools";
import { withTranslation } from "react-i18next";

import { Button, Icon, Modal, Box, SpaceBetween } from '@cloudscape-design/components';

import loadingGif from '../../assets/images/loading.gif';
import courseDefaultThumbnail from '../../assets/images/course-default-thumbnail.png';

class Cert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  
            course: null,
            userCourse: null,
            cert: null,
            userId: "",
            userEmail: "",
            userName: "",
            redirectToCourse: null,
            disabled: true,
            uiSet: {},
            defaultThumb: null,
            isMobile: window.innerWidth < 500
        };
    }

    componentDidMount() {
        getUISet().then((data) => {
            this.setState({ uiSet: data});
            if (data.DefaultThumb){
              Storage.get(data.DefaultThumb, {
                level: "public",
              }).then((res) => this.setState({ defaultThumb: res}));
            }
          }).catch((error) => console.log(error));

        this.loadUserId(() => {
            this.loadCourse();
            this.loadUserCourse();
        });

        window.addEventListener('resize', () => {
          this.setState({
              isMobile: window.innerWidth < 500
          });
        }, false);
    }
    
    async loadUserId(callback) {
        // let credentials = await Auth.currentUserCredentials();
        const credentials = await Auth.currentAuthenticatedUser({ bypassCache: false });
        // console.log(credentials)
        this.setState({
            userId: credentials.UserID,
        }, callback);


        Auth.currentAuthenticatedUser({
            // Optional, By default is false. If set to true, 
            // this call will send a request to Cognito to get the latest user data
            bypassCache: false
        }).then((user) => {
            this.setState({
                userEmail: user.attributes.email,
                userName: user.attributes['custom:name_on_certificate'],
            })
            console.log(user.attributes['custom:name_on_certificate'])
        });
    }

    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); // eslint-disable-line
        });
    }

    loadUserCourse() {
        const apiName = 'courses';
        const path = '/users/courses/' + window.location.hash.split('/')[2];
        
        API.get(apiName, path)
            .then((response) => {
                this.setState({
                    userCourse: response,
                }, () => {
                    console.log(response)
                    if (!response.CertificateID) {
                        this.generateCert();
                    } else {
                        this.loadCert();
                    }
                });
            })
            .catch((error) => {
                console.log(error.response);
            });
    }

    loadCert() {
        const apiName = 'courses';
        const path = '/certs/' + this.state.userCourse.CertificateID;
        
        API.get(apiName, path)
            .then((response) => {
                this.setState({
                    cert: response,
                    disabled: false,
                });
            })
            .catch((error) => {
                console.log(error.response);
            });
    }

    generateCert() {
        const apiName = 'courses';
        const path = '/certs';
        const myInit = {
            body: {
                ID: this.generateUUID(),
                UserID: this.state.userId,
                UserEmail: this.state.userEmail,
                UserName: this.state.userName,
                CourseID: this.state.course.id,
                CompletedTime: Date.now(),
            }
        };
        console.log("generateCert")
        API.put(apiName, path, myInit)
        .then((response) => {
            this.setState({cert: myInit.body, disabled: false});
            console.log(myInit)
            let userCourse = this.state.userCourse;
            userCourse.CertificateID = myInit.body.ID;
            const apiName = 'courses';
            const path = '/users/courses/';

            API.put(apiName, path, {body: userCourse})
            .then((response) => {
                // console.log(response);
            })
            .catch((error) => {
                console.log(error.response);
            });
        })
        .catch((error) => {
            console.log(error.response);
        });
    }

    loadCourse() {
        const apiName = 'courses';
        const path = '/courses/' + window.location.hash.split('/')[2];
        
        API.get(apiName, path)
            .then((response) => {
                this.setState({
                    course: {
                        id: response.ID,
                        name: response.Name,
                        categories: response.Categories,
                        tags: response.Tags,
                        level: response.Level,
                        length: response.Length,
                        description: response.Description,
                        whatToLearn: response.WhatToLearn,
                        requirements: response.Requirements,
                        chapters: response.Chapters,
                        totalLecture: 0,
                        certificateId: response.CertificateID,
                        shareCertOpen: false,
                    },
                });
            })
            .catch((error) => {
                console.log(error.response);
            });
    }

    getCourseName = () => {
        let courseNameList = this.state.course.name.split("-");
        return courseNameList.pop().toUpperCase();
    }

    downloadCert = () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let img = new Image();
        img.src = certBase;
        img.addEventListener("load", ()=>{
            canvas.width = img.width;
            canvas.height = img.height;
            const x = canvas.width / 2;

            ctx.drawImage(img,0,0);
            ctx.textAlign = "center";
            ctx.font = '900 80px sans-serif';
            ctx.fillStyle = this.state.uiSet?.MainColor;
            ctx.fillText(this.state.cert.UserName, x, img.height / 2 + 30);

            ctx.font = '900 50px sans-serif';
            ctx.fillStyle = this.state.uiSet?.MainColor;
            ctx.fillText(this.getCourseName(), x, img.height/2 + 230);

            ctx.font = '300 20px sans-serif';
            let certURL = `https://${window.location.host}/#/certPublic/`;
            certURL += !!this.state.cert ? this.state.cert.ID : "";
            ctx.fillText(certURL, x, img.height - 110);

            // ctx.position = "relative"
            ctx.font = '700 20px sans-serif';
            ctx.textAlign = "left"
            let issueDate = "ISSUED DATE - ";
            issueDate += this.state.cert ? transformDateTime(this.state.cert.CompletedTime).toUpperCase() : new Date().toDateString().toUpperCase();
            ctx.fillText(issueDate, x + 200, img.height - 190);

            const link = document.createElement("a");
            link.href = canvas.toDataURL();
            link.setAttribute("download", "certificate");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    render() {
        let course = this.state.course;
        const { t } = this.props;

        return this.state.redirectToCourse ? (
          <Navigate to={"/course/" + course.id} />
        ) : (
          // this.state.shareCertOpen ?
          // <Navigate to={`/certPublic/${this.state.cert.ID}`}/> :
          <div>
            <NavBar navigation={this.props.navigation} />
            <div className="cert-wrapper">
              {!course ? (
                <div>
                  <img
                    src={loadingGif}
                    alt="loading..."
                    className="cert-loading-gif"
                  />
                </div>
              ) : (
                <div className="cert-course">
                  <div className="cert-course-info">
                    <div className="cert-course-title">
                      {!!course.name ? course.name : ""}
                    </div>
                    <div className="cert-course-property">
                      <Icon
                        variant="subtle"
                        name="ticket"
                        className="cert-course-property-icon"
                      />{" "}
                      {t("common.level")} {!!course.level ? course.level : ""}
                    </div>
                    <div className="cert-course-property">
                      <Icon
                        variant="subtle"
                        name="check"
                        className="cert-course-property-icon"
                      />
                      {t("common.category")}
                      {!!course.categories
                        ? course.categories.map((category, index) => (
                            <span key={index}>
                              {index !== 0 ? ", " : " "}
                              <a href="/#">{category}</a>
                            </span>
                          ))
                        : ""}
                    </div>
                    {/* <div className='cert-course-property'>
                                <Icon variant='subtle' name='check' className='cert-course-property-icon'/> 
                                Tag:
                                {!!course.tags ? course.tags.map((tag, index) => <span key={index}>{index !== 0 ? ', ' : ' '}<a href='/#'>{tag}</a></span>) : ""}
                            </div> */}
                    <div className="cert-course-property">
                      <Icon
                        variant="subtle"
                        name="status-pending"
                        className="cert-course-property-icon"
                      />
                      {calcTimeBrief(course.length, t("common.hour"), t("common.minute"))}
                    </div>
                    <div className="cert-course-desc">
                      {!!course.description ? course.description : ""}
                    </div>
                  </div>
                  <div className="cert-course-thumbnail">
                    <img src={this.state.defaultThumb || courseDefaultThumbnail} alt="Course Thumbnail" />
                  </div>
                  <div className="cert-course-separator" />
                  {/* <div className='cert-progress'>
                            {!!this.state.completedLectures / this.state.totalLectures 
                                ? <ProgressBar
                                    value={this.state.completedLectures / this.state.totalLectures * 100}
                                /> : <img src={loadingGif} alt="loading..." className='cert-loading-gif' />}
                        </div> */}
                  <div className="cert-course-action">
                    <Button
                      variant="normal"
                      className="cert-continue-btn"
                      ariaLabel={t("cert.review")}
                      onClick={() =>
                        this.setState({ redirectToCourse: course.id })
                      }
                    >
                      {!this.state.isMobile ? t("cert.review") : ""} <Icon name="external" />
                    </Button>

                    <Button 
                      variant="primary" 
                      className='cert-continue-btn'
                      ariaLabel={t("cert.share")}
                      onClick={() => this.setState({shareCertOpen: true})}
                    >
                      {!this.state.isMobile ? t("cert.share") : ""} <Icon name='share' />
                    </Button>

                    <Button
                      variant="normal"
                      className="cert-continue-btn"
                      ariaLabel={t("cert.download")}
                      onClick={this.downloadCert}
                    >
                      {!this.state.isMobile ? t("cert.download") : ""} <Icon name="download" />
                    </Button>
                  </div>
                  <div className="cert-view">
                    {!this.state.cert ? (
                      <img
                        src={loadingGif}
                        alt="loading..."
                        className="cert-view-loading-gif"
                      />
                    ) : (
                      <div className="cert-view-container">
                        {/* <div>{this.state.cert.UserEmail}</div> */}
                        <canvas id="canvas"></canvas>
                      <div className="cert-view-user-name" style={{color: `${this.state.uiSet?.MainColor}`}}>
                          {this.state.cert.UserName}
                        </div>
                        <div className="cert-view-course-name" style={{color: `${this.state.uiSet?.MainColor}`}}>
                          {/* {(() => {
                                            let courseNameList = this.state.course.name.split("-");
                                            return courseNameList.pop().toUpperCase()
                                        })()} */}
                          {this.getCourseName()}
                        </div>
                        <div className="cert-view-issued-date" style={{color: `${this.state.uiSet?.MainColor}`}}>
                          ISSUED DATE -{" "}
                          {this.state.cert
                            ? transformDateTime(
                                this.state.cert.CompletedTime
                              ).toUpperCase()
                            : new Date().toDateString().toUpperCase()}
                          {/* {(() => {
                                            let courseNameList = this.state.course.name.split("-");
                                            return courseNameList.pop().toUpperCase()
                                        })()} */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Footer />
            <Modal
              onDismiss={() => this.setState({ shareCertOpen: false })}
              visible={this.state.shareCertOpen}
              size="large"
              footer={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      variant="primary"
                      onClick={() => this.setState({ shareCertOpen: false })}
                    >
                      {t("common.ok")}
                    </Button>
                  </SpaceBetween>
                </Box>
              }
              header= {t("cert.share_header")}
            >
              <Button
                variant="link"
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://" +
                      window.location.host +
                      "/#/certPublic/" +
                      (!!this.state.cert ? this.state.cert.ID : "")
                  );
                }}
              >
                <Icon name="copy" />
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  let url =
                    "https://" +
                    window.location.host +
                    "/#/certPublic/" +
                    (!!this.state.cert ? this.state.cert.ID : "");
                  window.open(url, "_blank");
                }}
              >
                https://{window.location.host}/#/certPublic/
                {!!this.state.cert ? this.state.cert.ID : ""}
              </Button>
            </Modal>
          </div>
        );
    };
}

export default withTranslation()(Cert)