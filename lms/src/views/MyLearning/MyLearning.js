import './MyLearning.css';
import React from 'react';
import { API } from 'aws-amplify';
import NavBar from '../../components/NavBar/NavBar';

import Footer from '../../components/Footer/Footer';
import MyLearningCourse from './MyLearningCourse';

import loadingGif from '../../assets/images/loading.gif';
import { apiName, myLearningPath } from "../../utils/api"

export default class MyLearning extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            courseToRedirect: null,
            mostRecentCourse: null,
            assignedCourses: [],
            selfEnrolledCourses: [],
        };
    }

    componentDidMount() {
        this.loadUserCourses();
    }

    loadUserCourses() {
        this.setState({ loading: true });
        API.get(apiName, myLearningPath)
            .then((response) => {
                let mostRecentCourse;
                let assignedCourses = [];
                let selfEnrolledCourses = [];
                console.log(response)
                response.forEach(course => {
                    let transformedCourse = {
                        id: course.CourseID,
                        lastAccessed: course.LastAccessed,
                        assigned: course.Assign,
                    }

                    if (!!transformedCourse.assigned) {
                        assignedCourses.push(transformedCourse.id);
                    } else {
                        selfEnrolledCourses.push(transformedCourse.id);
                    }

                    if (!!transformedCourse.lastAccessed) {
                        if (!mostRecentCourse || mostRecentCourse.lastAccessed < transformedCourse.lastAccessed) {
                            mostRecentCourse = transformedCourse;
                        }
                    }
                });
                this.setState({
                    mostRecentCourse: mostRecentCourse.id,
                    assignedCourses: assignedCourses,
                    selfEnrolledCourses: selfEnrolledCourses,
                    loading: false,
                });
            })
            .catch((error) => {
                console.log(error.response);
                this.setState({ loading: false });
            });
    }

    render() {
        return <div>
            <NavBar navigation={this.props.navigation} href="/mylearning"/>
            <div className='mylearning-wrapper'>
                {this.state.loading 
                    ? <div className='mylearning-main-container-loading'>
                        <img src={loadingGif} alt="loading..." className='mylearning-loading-gif-parent' />
                    </div> 
                    : <div className='mylearning-main-container'>
                        {!this.state.mostRecentCourse ? "" : <div>
                            <p className='mylearning-courses-header'>Hoạt động học tập</p>
                            <div className='mylearning-courses-header-decor' />
                            <MyLearningCourse courseId={this.state.mostRecentCourse} />
                        </div>}
                        <div>
                            <p className='mylearning-courses-header'>Khoá học trả phí đã đăng ký</p>
                            <div className='mylearning-courses-header-decor' />
                            {this.state.assignedCourses.length === 0
                                ? <div>Bạn chưa đăng ký khoá học trả phí nào</div>
                                : this.state.assignedCourses.map((course, index) => <MyLearningCourse key={index} courseId={course} />)
                            }
                        </div>
                        <div>
                            <p className='mylearning-courses-header'>Khoá học đã đăng ký</p>
                            <div className='mylearning-courses-header-decor' />
                            {console.log(this.state.selfEnrolledCourses)}
                            {this.state.selfEnrolledCourses.length === 0
                                ? <div>
                                    Bạn chưa đăng ký khoá học miễn phí nào
                                    <div className='space-40'/>
                                </div>
                                : this.state.selfEnrolledCourses.map((course, index) => <MyLearningCourse key={index} courseId={course} />)
                            }
                        </div>
                    </div>}
            </div>
            <Footer />
        </div>;
    }
}