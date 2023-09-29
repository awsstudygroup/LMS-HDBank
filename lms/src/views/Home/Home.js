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
import { Auth } from "aws-amplify";
import { withTranslation } from "react-i18next";
import {
  apiName,
  coursePath,
  publicCoursePath,
  userCoursePath,
} from "../../utils/api";
import { calcTime } from "../../utils/tools"

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
    };
  }

  async checkLoggedIn() {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: false });
      console.log(user)
      this.setState({
        authChecked: true,
        authenticated: true,
      });
    } catch {
      this.setState({
        authChecked: true,
        authenticated: false,
      });
    }
  }

  async getCourse() {
    let transformedCourses = [];
    this.setState({ loading: true });

    // Assigned course
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

  componentDidMount() {
    this.getCourse();
    this.checkLoggedIn();
  }

  redirectToCourse(courseId) {
    this.setState({ courseToRedirect: courseId });
  }

  renderHighLight = (hightLight) => {
    return (
      <>
        <div className="hightLight-items">
          <img
            className="dashboard-highlight-icon"
            src={hightlightIcon1}
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
            src={hightlightIcon2}
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
            src={hightlightIcon3}
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

  render() {
    const { t } = this.props;
    // console.log("props ", this.props);
    const hightLight = t("home.highlight", { returnObjects: true });
    // console.log(hightLight);
    return !!this.state.courseToRedirect ? (
      <Navigate to={"/course/" + this.state.courseToRedirect} />
    ) : (
      <>
        <NavBar
          href="/"
          navigation={this.props.navigation}
          title="Cloud Solutions Journey"
        />
        <div className="dashboard-main">
          <div className="dashboard-banner">
            <Grid gridDefinition={[{ colspan: 10 }, { colspan: 2 }]}>
              <div>
                <p className="dashboard-banner-title">{t("home.title")}</p>
                <p className="dashboard-banner-desc">{t("home.des")}</p>
              </div>
              <div className="dashboard-banner-icon-container">
                <img
                  className="dashboard-banner-icon"
                  src={bannerIcon}
                  alt="Banner Icon"
                />
              </div>
            </Grid>
          </div>
          <div className="dashboard-highlight">
            {/* {window.innerWidth < 768 ? (
              <div>
                {this.renderHighLight(hightLight)}
              </div>
            ) : (
              <Grid
                gridDefinition={[
                  { colspan: 4 },
                  { colspan: 4 },
                  { colspan: 4 },
                ]}
              >
                {this.renderHighLight(hightLight)}
              </Grid>
            )} */}
            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              {this.renderHighLight(hightLight)}
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
              ) : (
                this.state.courses.map((course) => (
                  <div className="dashboard-courses-list-item" key={course.id}>
                    <div className="dashboard-courses-list-item-info">
                      <div className="dashboard-courses-list-item-title">
                        {course.name}
                      </div>
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
                        {/* {Math.floor(course.length / 3600) > 0
                          ? Math.floor(course.length / 3600) + " hours "
                          : ""}
                        {(course.length % 3600) / 60 > 0
                          ? Math.floor((course.length % 3600) / 60) +
                            " minutes "
                          : ""}
                        {(course.length % 3600) % 60 > 0
                          ? ((course.length % 3600) % 60) + " seconds"
                          : ""} */}
                          {calcTime(course.length)}
                      </div>
                      <div className="dashboard-courses-list-item-desc">
                        {course.description}
                      </div>
                    </div>
                    <div className="dashboard-courses-list-item-thumbnail">
                      <img
                        src={courseDefaultThumbnail}
                        alt="Course Thumbnail"
                      />
                    </div>
                    <div className="dashboard-courses-list-item-separator" />
                    <div className="dashboard-courses-list-item-action">
                      <Button
                        variant="primary"
                        className="btn-orange"
                        onClick={() => this.redirectToCourse(course.id)}
                      >
                        Get Started{" "}
                        <Icon name="arrow-left" className="rotate-180" />
                      </Button>
                    </div>
                  </div>
                ))
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
