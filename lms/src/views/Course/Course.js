import React from 'react';
import './Course.css';
import { Navigate } from "react-router-dom";
import { API } from 'aws-amplify';
import { Grid, Button, Icon, ExpandableSection } from '@cloudscape-design/components';
import courseDefaultThumbnail from '../../assets/images/course-default-thumbnail.png';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import loadingGif from '../../assets/images/loading.gif';
import { calcTimeBrief } from "../../utils/tools";

export default class Course extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            course: null,
            redirectToLearn: false,
            loading: true,
        };
    }

    async getCourse() {
        this.setState({ loading: true });

        const apiName = 'courses';
        const path = '/courses/' + window.location.hash.split('/')[2];
        
        API.get(apiName, path)
        .then((response) => {
            this.setState({course: {
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
            },
            loading: false});
        })
        .catch((error) => {
            console.log(error.response);
            this.setState({ loading: false });
        });
    }

    componentDidMount() {
        this.getCourse();
    }

    openLearn() {
        this.setState({
            redirectToLearn: true
        })
    }

    render() {
        let course = this.state.course;
        let chapters = [];
        let videoCount = 0;
        let labCount = 0;
        let quiz = 0;
        if (!!course) {
            chapters = course.chapters;
            chapters.forEach(chapter => {
                chapter.lectures.forEach(lecture => {
                    switch(lecture.type) {
                        case 'Video':
                            videoCount++;
                            return;
                        case 'Workshop':
                            labCount++;
                            return;
                        case 'Quiz':
                            quiz++;
                            return;
                        default:
                            return;
                    }
                })
            })
        }

        return this.state.redirectToLearn ?
            <Navigate to={'/learn/' + course.id} /> :
            <div>
                <NavBar navigation={this.props.navigation} title="Cloud Solutions Journey"/>
                {this.state.loading ? <div className='course-main'>
                    <img src={loadingGif} alt="loading..." className='course-loading-gif' />
                </div>
                : <div className='course-main'>
                    <div className='course-info'>
                            <div className='course-title'>
                            {course.name}
                        </div>
                        <div className='course-property'>
                            <Icon variant='subtle' name='ticket' className='course-property-icon'/> Level: {course.level}
                        </div>
                        <div className='course-property'>
                            <Icon variant='subtle' name='check' className='course-property-icon'/> 
                            Category: 
                            {course.categories.map((category, index) => <span key={index}>{index !== 0 ? ', ' : ' '}<a href='/#'>{category}</a></span>)}
                        </div>
                        {/* <div className='course-property'>
                            <Icon variant='subtle' name='check' className='course-property-icon'/> 
                            Tag:
                            {course.tags && course.tags.map((tag, index) => <span key={index}>{index !== 0 ? ', ' : ' '}<a href='/#'>{tag}</a></span>)}
                        </div> */}
                        <div className='course-property'>
                            <Icon variant='subtle' name='status-pending' className='course-property-icon'/> 
                            {calcTimeBrief(course.length)}
                        </div>
                        <div className='course-desc'>
                            {course.description}
                        </div>
                    </div>
                    <div className='course-thumbnail'>
                        <img src={courseDefaultThumbnail} alt='Course Thumbnail'/>
                    </div>

                    <div className='course-separator' />

                    <div className='course-bottom'>
                        <Grid
                            gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                            >
                            <div>
                                <div className='course-what-to-learn-title'>
                                    What you'll learn
                                </div>
                                {course.whatToLearn.map((item, index) => <div key={index} className='course-what-to-learn-item'>
                                    <Icon variant='subtle' name='check'/> 
                                    <div>{item}</div>
                                </div>)}
                            </div>
                            <div>
                                <div className='board'>
                                    <div className='board-header'>
                                        This couse includes
                                    </div>
                                    <div className='board-content'>
                                        <div className='course-what-to-learn-item'>
                                            <Icon variant='subtle' name='multiscreen'/> 
                                            <div>{videoCount} on-demand videos</div>
                                        </div>
                                        <div className='course-what-to-learn-item'>
                                            <Icon variant='subtle' name='thumbs-up-filled'/>
                                            <div>{labCount} hands-on labs</div>
                                        </div>
                                        {/* <div className='course-what-to-learn-item'>
                                            <Icon variant='subtle' name='calendar'/>
                                            <div>{quiz} quizzes</div>
                                        </div> */}
                                    </div>
                                    <div className='board-footer'>
                                        <Button variant='primary' className='btn-orange' onClick={() => this.openLearn()}>
                                            Start Course
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                        
                        <div className='space-20' />

                        <div className='board'>
                            <div className='board-header'>
                                Course content
                            </div>
                            <div className='board-content'>
                                {course.chapters.map((chapter, index) => <ExpandableSection key={index} className='course-lectures' headerText={chapter.name}>
                                    {chapter.lectures.map((lecture, index) => <div key={index} className='course-lecture-item'>
                                        {lecture.type === 'video' 
                                            ? <Icon name='audio-full' className='course-property-icon'/>
                                            : <Icon name='check' className='course-property-icon'/>}
                                        {lecture.name}
                                    </div>)}
                                </ExpandableSection>)}
                            </div>
                        </div>
                        
                        <div className='space-40' />

                        <div className='board'>
                            <div className='board-header'>
                                Requirements
                            </div>
                            <div className='board-content'>
                                {course.requirements.map((requirement, index) => <ul key={index}>
                                    <li>{requirement}</li>
                                </ul>)}
                            </div>
                        </div>
                        
                        <div className='space-40' />
                    </div>
                </div>}
                <Footer />
            </div>;
    }
}