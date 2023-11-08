import React from "react";
import "./Home.css";
import { Navigate } from "react-router-dom";
// import { useLocale } from "./context/locale";
// import { REGIONS } from "./context/locale/constants";
import { API } from "aws-amplify";
import { Grid, Button, Icon } from "@cloudscape-design/components";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";

import bannerIcon from "../../assets/images/dashboard-banner-icon.png";
import hightlightIcon1 from "../../assets/images/dashboard-highlight-1.png";
import hightlightIcon2 from "../../assets/images/dashboard-highlight-2.png";
import hightlightIcon3 from "../../assets/images/dashboard-highlight-3.png";
import courseDefaultThumbnail from "../../assets/images/course-default-thumbnail.png";
import loadingGif from "../../assets/images/loading.gif";
import { Auth, Storage } from "aws-amplify";
import { withTranslation } from "react-i18next";
import {
  apiName,
  coursePath,
  publicCoursePath,
  userCoursePath,
  configUI,
} from "../../utils/api";
import { uiConfigId } from "../../utils/uiConfig";
import { calcTime, calcTimeBrief } from "../../utils/tools";

export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      courseToRedirect: null,
      courses: [],
      language: "en",
      loading: false,
      authChecked: false,
      authenticated: false,
      searchKey: "",
      foundCourses: [],
      uiSet: null,
      banner: null,
      bannerIcon: null,
      HLImages: [],
    };
  }

  async checkLoggedIn(callback) {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: false });
      // console.log(user)
      this.setState(
        {
          authChecked: true,
          authenticated: true,
        },
        callback
      );
    } catch {
      this.setState(
        {
          authChecked: true,
          authenticated: false,
        },
        callback
      );
    }
  }

  async getCourse() {
    let transformedCourses = [];
    this.setState({ loading: true });

    // Assigned course
    if (this.state.authenticated) {
      try {
        const userCourseResp = await API.get(apiName, userCoursePath);
        console.log(userCourseResp);
        if (userCourseResp.length > 0) {
          for (let i = 0; i < userCourseResp.length; i++) {
            const courseResp = await API.get(
              apiName,
              coursePath + `${userCourseResp[i].CourseID}`
            );
            transformedCourses.push({
              id: courseResp.ID,
              name: courseResp.Name,
              categories: courseResp.Categories,
              tags: courseResp.Tags,
              level: courseResp.Level,
              length: courseResp.Length,
              description: courseResp.Description,
            });
          }
        }
      } catch (error) {
        console.log(error);
        // this.setState({ loading: false });
      }
    }

    // Public course
    try {
      const publicCourseResp = await API.get(apiName, publicCoursePath);
      publicCourseResp.forEach((course) => {
        transformedCourses.push({
          id: course.ID,
          name: course.Name,
          categories: course.Categories,
          tags: course.Tags,
          level: course.Level,
          length: course.Length,
          description: course.Description,
        });
      });
      // console.log(transformedCourses);
      this.setState({ courses: transformedCourses, loading: false });
    } catch (error) {
      console.log(error);
      this.setState({ loading: false });
    }
  }

  searchCourses = () => {
    let foundCourses = [];
    for (let i = 0; i < this.state.courses.length; i++) {
      if (
        this.state.courses[i].name.toLowerCase().includes(this.state.searchKey)
      ) {
        foundCourses.push(this.state.courses[i]);
      }
    }
    this.setState({ foundCourses: foundCourses });
  };

  loadUISet = () => {
    API.get(apiName, configUI + uiConfigId)
      .then((data) => {
        // console.log(data)
        if ( data ) {
          this.setState({ uiSet: data });
          this.loadImage(data)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.checkLoggedIn(() => this.getCourse());
    let localParams = localStorage.getItem("AWSLIBVN_UISET");
    // console.log(localParams)
    let data = JSON.parse(localParams)
    if (data) {
      this.setState({ uiSet: data });
      this.loadImage(JSON.parse(localParams))
    } else {
      this.loadUISet();
    }
  }

  redirectToCourse(courseId) {
    this.setState({ courseToRedirect: courseId });
  }

  async loadImage(data) {
    console.log(data)
    Storage.get(data.Banner, { level: "public" }).then((res) => {
      this.setState({ banner: res });
      // console.log(res);
    });
    Storage.get(data.BannerIcon, { level: "public" }).then((res) => {
      this.setState({ bannerIcon: res });
      // console.log(res);
    });

    var currentHLImage = [];
    for(let i=0; i < data.HLImages.length; i++){
      Storage.get(data.HLImages[i], { level: "public" }).then((res) => {
        currentHLImage.push(res)
        if ( i === data.HLImages.length - 1 ){
          this.setState({ HLImages: currentHLImage })
        }
        // console.log(res);
      });
    }
    // while()
  }

  renderHighLight = (hightLight) => {
    // console.log(this.state.HLImages)
    return (
      <>
        <div className="hightLight-items">
          <img
            className="dashboard-highlight-icon"
            src={this.state.HLImages[0] ? this.state.HLImages[0] : hightlightIcon1}
            alt="Highlight Icon 1"
          />
          <div className="dashboard-highlight-text-container">
            <div className="dashboard-highlight-title">
              {hightLight[0].title}
            </div>
            <div className="dashboard-highlight-desc">{hightLight[0].desc}</div>
          </div>
        </div>
        <div className="hightLight-items">
          <img
            className="dashboard-highlight-icon"
            src={this.state.HLImages[1] ? this.state.HLImages[1] : hightlightIcon2}
            alt="Highlight Icon 2"
          />
          <div className="dashboard-highlight-text-container">
            <div className="dashboard-highlight-title">
              {hightLight[1].title}
            </div>
            <div className="dashboard-highlight-desc">{hightLight[1].desc}</div>
          </div>
        </div>
        <div className="hightLight-items">
          <img
            className="dashboard-highlight-icon"
            src={this.state.HLImages[2] ? this.state.HLImages[2] : hightlightIcon3}
            alt="Highlight Icon 3"
          />
          <div className="dashboard-highlight-text-container">
            <div className="dashboard-highlight-title">
              {hightLight[2].title}
            </div>
            <div className="dashboard-highlight-desc">{hightLight[2].desc}</div>
          </div>
        </div>
      </>
    );
  };

  renderCourses = (course) => {
    return (
      <div className="dashboard-courses-list-item" key={course.id}>
        <div className="dashboard-courses-list-item-info">
          <div className="dashboard-courses-list-item-title">{course.name}</div>
          <div className="dashboard-courses-list-item-property">
            <Icon
              variant="subtle"
              name="ticket"
              className="dashboard-courses-list-item-property-icon"
            />{" "}
            Level: {course.level}
          </div>
          <div className="dashboard-courses-list-item-property">
            <Icon
              variant="subtle"
              name="check"
              className="dashboard-courses-list-item-property-icon"
            />
            Category:
            {course.categories.map((category, index) => (
              <span key={index}>
                {index !== 0 ? ", " : " "}
                <a href="/#">{category}</a>
              </span>
            ))}
          </div>
          <div className="dashboard-courses-list-item-property">
            <Icon
              variant="subtle"
              name="check"
              className="dashboard-courses-list-item-property-icon"
            />
            Tag:
            {course.tags &&
              course.tags.map((tag, index) => (
                <span key={index}>
                  {index !== 0 ? ", " : " "}
                  <a href="/#">{tag}</a>
                </span>
              ))}
          </div>
          <div className="dashboard-courses-list-item-property">
            <Icon
              variant="subtle"
              name="status-pending"
              className="dashboard-courses-list-item-property-icon"
            />
            {calcTimeBrief(course.length)}
          </div>
          <div className="dashboard-courses-list-item-desc">
            {course.description}
          </div>
        </div>
        <div className="dashboard-courses-list-item-thumbnail">
          <img src={courseDefaultThumbnail} alt="Course Thumbnail" />
        </div>
        <div className="dashboard-courses-list-item-separator" />
        <div className="dashboard-courses-list-item-action">
          <Button
            variant="primary"
            className="btn-blue-light"
            onClick={() => this.redirectToCourse(course.id)}
          >
            Bắt đầu <Icon name="arrow-left" className="rotate-180" />
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const hightLight = t("home.highlight", { returnObjects: true });
    // const hightLight = this.state.uiSet ? this.state.uiSet.Highlight : t("home.highlight", { returnObjects: true });
    // console.log(this.state.uiSet.Highlight[0]['desc']);
    return !!this.state.courseToRedirect ? (
      <Navigate to={"/course/" + this.state.courseToRedirect} />
    ) : !this.state.uiSet ? (
      <>
      <NavBar
          href="/"
          navigation={this.props.navigation}
          title="Cloud Solutions Journey"
          setSearchKey={(key) => this.setState({ searchKey: key })}
          searchKey={this.state.searchKey}
          searchCourse={() => this.searchCourses()}
        />
        <div className="dashboard-main">
          <div className="dashboard-banner">
            <Grid gridDefinition={[{ colspan: 10 }, { colspan: 2 }]}>
              <div>
                <p className="dashboard-banner-title">{t("home.title")}</p>
                <p className="dashboard-banner-desc">{t("home.des")}</p>
              </div>
              <div className="dashboard-banner-icon-container">
                {/* <img
                  className="dashboard-banner-icon"
                  src={bannerIcon}
                  alt="Banner Icon"
                /> */}
              </div>
            </Grid>
          </div>
          <div className="dashboard-highlight">
            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              {this.renderHighLight(hightLight)}
            </Grid>
          </div>
          <div className="dashboard-courses">
            <div className="dashboard-courses-header">
              {this.state.authChecked
                ? t("home.list_title")
                : t("home.list_title_unauthen")}
            </div>
            <div className="dashboard-courses-header-decor" />
            <div className="dashboard-courses-list">
              {this.state.loading ? (
                <img
                  src={loadingGif}
                  alt="loading..."
                  className="dashboard-loading-gif"
                />
              ) : this.state.searchKey ? (
                this.state.foundCourses.map((course) =>
                  this.renderCourses(course)
                )
              ) : (
                this.state.courses.map((course) => this.renderCourses(course))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    ) : (
      <>
        <NavBar
          href="/"
          navigation={this.props.navigation}
          title="Cloud Solutions Journey"
          setSearchKey={(key) => this.setState({ searchKey: key })}
          searchKey={this.state.searchKey}
          searchCourse={() => this.searchCourses()}
        />
        <div className="dashboard-main">
          <div className="dashboard-banner" style={{backgroundImage: `url(${this.state.banner})`}}>
            <Grid gridDefinition={[{ colspan: 10 }, { colspan: 2 }]}>
              <div>
                <p className="dashboard-banner-title">
                  {
                    //t("home.title")
                    this.state.uiSet.WebTitle
                  }
                </p>
                <p className="dashboard-banner-desc">
                  {
                    // t("home.des")
                    this.state.uiSet.WebDesc
                  }
                </p>
              </div>
              <div className="dashboard-banner-icon-container">
                <img
                  className="dashboard-banner-icon"
                  src={this.state.bannerIcon}
                  alt="Banner Icon"
                />
              </div>
            </Grid>
          </div>
          <div className="dashboard-highlight">
            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              {this.renderHighLight(this.state.uiSet.Highlight)}
            </Grid>
          </div>
          <div className="dashboard-courses">
            <p className="dashboard-courses-header">
              {this.state.authChecked
                ? t("home.list_title")
                : t("home.list_title_unauthen")}
            </p>
            <div className="dashboard-courses-header-decor" />
            <div className="dashboard-courses-list">
              {this.state.loading ? (
                <img
                  src={loadingGif}
                  alt="loading..."
                  className="dashboard-loading-gif"
                />
              ) : this.state.searchKey ? (
                this.state.foundCourses.map((course) =>
                  this.renderCourses(course)
                )
              ) : (
                this.state.courses.map((course) => this.renderCourses(course))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}

export default withTranslation()(Home);
