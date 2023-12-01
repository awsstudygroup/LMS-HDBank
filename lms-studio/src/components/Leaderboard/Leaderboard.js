import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
// import { withAuthenticator } from '@aws-amplify/ui-react';

import SideNavigation from "@cloudscape-design/components/side-navigation";
import Applayout from "@cloudscape-design/components/app-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Grid from "@cloudscape-design/components/grid";
import ContentLayout from "@cloudscape-design/components/content-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Link from "@cloudscape-design/components/link";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Tabs from "@cloudscape-design/components/tabs";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useNavigate } from "react-router-dom";
import { API, Auth } from "aws-amplify";
import {
  apiName,
  coursePath,
  courseTopViewPath,
  userPath,
  byUserName,
} from "../../utils/api";
import "./Leaderboard.css";

const Leaderboard = (props) => {
  const [activeHref, setActiveHref] = useState("leaderboard");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = React.useState([
    { name: "Item 2" },
  ]);
  const [topCourse, setTopCourse] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getTopCourse();
  }, []);

  const getTopCourse = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, coursePath + courseTopViewPath);
      let i = 0;
      const userPoolId = Auth.userPool.userPoolId;
      let topCourseTemp = [...data];
      while (i < data.length) {
        const response = await API.get(
          apiName,
          userPath +
            byUserName +
            `?username=${data[i].CreatorID}&userPoolId=${userPoolId}`
        );
        console.log(response)
        topCourseTemp[i]["Creator"] = response.UserAttributes[2].Value;
        i++;
      }
      setTopCourse(topCourseTemp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getTopLecture = async () => {
    
  }
  const getCreator = async (item, userPoolId) => {
    try {
      const response = await API.get(
        apiName,
        userPath + byUserName + `?username=${item}&userPoolId=${userPoolId}`
      );
      return response;
    } catch (error) {
      return ''
    }
  };

  return (
    <>
      <NavBar navigation={props.navigation} title="Cloud Academy" />

      <div className="dashboard-main">
        <Applayout
          navigation={
            <SideNavigation
              activeHref={activeHref}
              header={{ href: "/", text: "Management" }}
              onFollow={(event) => {
                if (!event.detail.external) {
                  event.preventDefault();
                  const href =
                    event.detail.href === "/"
                      ? "leaderboard"
                      : event.detail.href;
                  setActiveHref(href);
                  navigate(`/management/${href}`);
                }
              }}
              items={[
                {
                  type: "section",
                  text: "Lectures",
                  items: [
                    {
                      type: "link",
                      text: "My Lectures",
                      href: "myLectures",
                    },
                    {
                      type: "link",
                      text: "Public Lectures",
                      href: "publicLectures",
                    },
                  ],
                },
                {
                  type: "section",
                  text: "Courses",
                  items: [
                    {
                      type: "link",
                      text: "My Courses",
                      href: "myCourses",
                    },
                    {
                      type: "link",
                      text: "Public Courses",
                      href: "publicCourses",
                    },
                    {
                      type: "link",
                      text: "Private Courses",
                      href: "privateCourses",
                    },
                  ],
                },
                { type: "link", text: "User", href: "user" },
                {
                  type: "link",
                  text: "Leaderboard",
                  href: "leaderboard",
                },
                { type: "link", text: "Sale", href: "sale" },
              ]}
            />
          }
          content={
            <div>
              {/* <ContentLayout
                header={
                  <SpaceBetween size="m">
                    <Header
                      variant="h1"
                      info={<Link>Info</Link>}
                      description="View the top courses for this week!"
                      // actions={
                      //   <Button variant="primary">Button</Button>
                      // }
                    >
                      Top Contributors
                    </Header>
                  </SpaceBetween>
                }
              >
                <Grid
                  className="top-attribute"
                  gridDefinition={[
                    { colspan: { default: 4, xxs: 4 } },
                    { colspan: { default: 4, xxs: 4 } },
                    { colspan: { default: 4, xxs: 4 } },
                  ]}
                >
                  <div style={{ paddingTop: 60 , maxWidth: "100%"}}>
                    <Container
                      media={{
                        content: (
                          <img
                            src="/courseImg-2.jpg"
                            alt="courseThumbnail"
                          />
                        ),
                        height: 200,
                        position: 'top',
                      }}
                      footer={
                        <div className="container-media-footer">
                          <Link href="#">
                            Created by Tuan Vo (@mintuan){' '}
                          </Link>
                          <Button iconName="share" variant="icon" />
                          <Box variant="small">
                            Opportunity Influenced: 200k ARR
                          </Box>
                          <Box variant="small">
                            Last Update: 5 hours ago
                          </Box>
                        </div>
                      }
                    >
                      <SpaceBetween direction="vertical" size="s">
                        <SpaceBetween direction="vertical" size="xxs">
                          <Box variant="small">
                            #sagemaker #s3 #personalise
                          </Box>
                          <Box variant="h2">
                            Building a System Recommender on AWS
                          </Box>
                        </SpaceBetween>
                        Participants will learn about the fundamental
                        concepts of recommendation systems, data
                        preprocessing and feature engineering
                        techniques, and how to train and evaluate
                        machine learning models for generating
                        accurate recommendations. They will also gain
                        hands-on experience in utilizing AWS services
                        such as Amazon S3 for data storage, Amazon
                        SageMaker for model training and deployment,
                        and Amazon Personalize for building scalable
                        recommendation systems.
                        <Button href="/management/publicCourses">
                          Go to Course
                        </Button>
                      </SpaceBetween>
                    </Container>
                  </div>

                  <div style={{ paddingTop: 60 }}>
                    <Container
                      media={{
                        content: (
                          <img
                            src="/courseImg-1.jpg"
                            alt="courseThumbnail"
                          />
                        ),
                        height: 200,
                        position: 'top',
                      }}
                      footer={
                        <div className="container-media-footer">
                          <Link href="#">
                            Created by Trinh Vo (@trinhvo)
                          </Link>
                          <Button iconName="share" variant="icon" />
                          <Box variant="small">
                            Opportunity Influenced: 320k ARR
                          </Box>
                          <Box variant="small">
                            Last Update: 5 hours ago
                          </Box>
                        </div>
                      }
                    >
                      <SpaceBetween direction="vertical" size="s">
                        <SpaceBetween direction="vertical" size="xxs">
                          <Box variant="small">
                            #data #analytics #jupyter
                          </Box>
                          <Box variant="h2">Juptyer x AWS</Box>
                        </SpaceBetween>
                        Participants will gain hands-on experience in
                        setting up Jupyter Notebooks on AWS and learn
                        how to seamlessly integrate various AWS
                        services into their data analysis and machine
                        learning workflows. The course covers topics
                        such as accessing and managing AWS resources
                        from Jupyter Notebooks, utilizing AWS SDKs and
                        APIs for data retrieval and storage, deploying
                        and scaling Jupyter environments on AWS, and
                        leveraging AWS machine learning services for
                        advanced analytics.
                        <Button href="/management/publicCourses">
                          Go to Course
                        </Button>
                      </SpaceBetween>
                    </Container>
                  </div>

                  <div style={{ paddingTop: 60 }}>
                    <Container
                      media={{
                        content: (
                          <img
                            src="/courseImg-3.png"
                            alt="courseThumbnail"
                          />
                        ),
                        height: 200,
                        position: 'top',
                      }}
                      footer={
                        <div className="container-media-footer">
                          <Link href="#">
                            Created by Gia Lim (@lmlim){' '}
                          </Link>
                          <Button iconName="share" variant="icon" />
                          <Box variant="small">
                            Opportunity Influenced: 180k ARR
                          </Box>
                          <Box variant="small">
                            Last Update: 5 hours ago
                          </Box>
                        </div>
                      }
                    >
                      <SpaceBetween direction="vertical" size="s">
                        <SpaceBetween direction="vertical" size="xxs">
                          <Box variant="small">
                            #costexplorer #usagereport #costop
                          </Box>
                          <Box variant="h2">
                            Starting Your Cloud Financial Management
                            Journey: Cost Visibility
                          </Box>
                        </SpaceBetween>
                        Participants will explore various tools and
                        techniques for tracking and analyzing cost
                        data, including cost allocation tags, AWS Cost
                        Explorer, and AWS Cost and Usage Reports. They
                        will also learn how to set up budgets and
                        alerts to proactively monitor their spending
                        and avoid any unexpected cost overruns. By the
                        end of the course, participants will have a
                        clear understanding of their cloud cost
                        landscape and the knowledge to implement
                        strategies that drive cost optimization and
                        maximize the value of their cloud investments.
                        <Button href="/management/publicCourses">
                          Go to Course
                        </Button>
                      </SpaceBetween>
                    </Container>
                  </div>
                </Grid>
              </ContentLayout>
              <Outlet />
              <div style={{ paddingTop: 32 }}>
                <Table
                  onSelectionChange={({ detail }) =>
                    setSelectedItems(detail.selectedItems)
                  }
                  selectedItems={selectedItems}
                  ariaLabels={{
                    selectionGroupLabel: 'Items selection',
                    allItemsSelectionLabel: ({ selectedItems }) =>
                      `${selectedItems.length} ${
                        selectedItems.length === 1 ? 'item' : 'items'
                      } selected`,
                    itemSelectionLabel: ({ selectedItems }, item) => {
                      const isItemSelected = selectedItems.filter(
                        (i) => i.name === item.name
                      ).length;
                      return `${item.name} is ${
                        isItemSelected ? '' : 'not'
                      } selected`;
                    },
                  }}
                  columnDefinitions={[
                    {
                      id: 'Contributor Name',
                      header: 'Contributor Name',
                      cell: (e) => e.name,
                      sortingField: 'name',
                      isRowHeader: true,
                    },
                    {
                      id: 'Course Name',
                      header: 'Course Name',
                      cell: (e) => e.alt,
                      sortingField: 'alt',
                    },
                    {
                      id: 'Opp Value',
                      header: 'Opp Value',
                      cell: (e) => e.type,
                    },
                    {
                      id: 'description',
                      header: 'Description',
                      cell: (e) => e.description,
                    },
                    {
                      id: 'userRating',
                      header: 'userRating',
                      cell: (e) => e.userRating,
                      sortingField: 'userRating',
                    },
                  ]}
                  columnDisplay={[
                    { id: 'Contributor Name', visible: true },
                    { id: 'Course Name', visible: true },
                    { id: 'Opp Value', visible: true },
                    { id: 'description', visible: true },
                    { id: 'userRating', visible: true },
                  ]}
                  items={[
                    {
                      name: 'Hung Ngyuen Gia ',
                      alt: 'Intro to AWS',
                      description: 'This course is an intro to AWS',
                      type: '150k ARR',
                      size: 'Small',
                      userRating: '5 out of 5',
                    },
                    {
                      name: 'Arief Hidayat',
                      alt: 'How to be an SA',
                      description: 'Be the best SA',
                      type: '100k ARR',
                      size: 'Large',
                      userRating: '4.8 out of 5',
                    },
                    {
                      name: 'Quang Chu',
                      alt: 'How to eat Spicy Food',
                      description:
                        'I am an pro now, let me teach you!',
                      type: '80 ARR',
                      size: 'Large',
                      userRating: '4.9 out of 5',
                    },
                    {
                      name: 'Wanich',
                      alt: 'Be a backend pro!',
                      description:
                        'Learn how to build backend in 2 days!',
                      type: '90 ARR',
                      size: 'Small',
                      userRating: '5 out of 5',
                    },
                    {
                      name: 'Hang Duong',
                      alt: 'Hello World App',
                      description: 'Set up an Amplify App on AWS',
                      type: '120 ARR',
                      size: 'Large',
                      userRating: '4.6 out of 5',
                    },
                    {
                      name: 'Tanisorn',
                      alt: 'Have a Kit Kat',
                      description: 'Take a break man!',
                      type: '500 ARR',
                      size: 'Small',
                      userRating: '5 out of 5',
                    },
                  ]}
                  loadingText="Loading resources"
                  selectionType="multi"
                  trackBy="name"
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No resources</b>
                      <Box
                        padding={{ bottom: 's' }}
                        variant="p"
                        color="inherit"
                      >
                        No resources to display.
                      </Box>
                      <Button>Create resource</Button>
                    </Box>
                  }
                  filter={
                    <TextFilter
                      filteringcourseThumbnail="Find Course Names"
                      filteringText=""
                    />
                  }
                  header={
                    <Header
                      counter={
                        selectedItems.length
                          ? '(' + selectedItems.length + '/10)'
                          : '(10)'
                      }
                    >
                      All Contributors
                    </Header>
                  }
                  pagination={
                    <Pagination currentPageIndex={1} pagesCount={2} />
                  }
                  preferences={
                    <CollectionPreferences
                      title="Preferences"
                      confirmLabel="Confirm"
                      cancelLabel="Cancel"
                      preferences={{
                        pageSize: 10,
                        contentDisplay: [
                          { id: 'Contributor Name', visible: true },
                          { id: 'Course Name', visible: true },
                          { id: 'Opp Value', visible: true },
                          { id: 'description', visible: true },
                          { id: 'userRating', visible: true },
                        ],
                      }}
                      pageSizePreference={{
                        title: 'Page size',
                        options: [
                          { value: 10, label: '10 resources' },
                          { value: 20, label: '20 resources' },
                        ],
                      }}
                      wrapLinesPreference={{}}
                      stripedRowsPreference={{}}
                      contentDensityPreference={{}}
                      contentDisplayPreference={{
                        options: [
                          {
                            id: 'Contributor Name',
                            label: 'Contributor Name',
                            alwaysVisible: true,
                          },
                          {
                            id: 'Course Name',
                            label: 'Course Name',
                          },
                          { id: 'Opp Value', label: 'Opp Value' },
                          { id: 'description', label: 'Description' },
                          { id: 'userRating', label: 'userRating' },
                        ],
                      }}
                      stickyColumnsPreference={{
                        firstColumns: {
                          title: 'Stick first column(s)',
                          description:
                            'Keep the first column(s) visible while horizontally scrolling the table content.',
                          options: [
                            { label: 'None', value: 0 },
                            { label: 'First column', value: 1 },
                            { label: 'First two columns', value: 2 },
                          ],
                        },
                        lastColumns: {
                          title: 'Stick last column',
                          description:
                            'Keep the last column visible while horizontally scrolling the table content.',
                          options: [
                            { label: 'None', value: 0 },
                            { label: 'Last column', value: 1 },
                          ],
                        },
                      }}
                    />
                  }
                />
              </div> */}
              <Tabs
                tabs={[
                  {
                    label: "Top Courses",
                    id: "courses",
                    content: (
                      <div>
                        <Table
                          onSelectionChange={({ detail }) =>
                            setSelectedItems(detail.selectedItems)
                          }
                          selectedItems={selectedItems}
                          ariaLabels={{
                            selectionGroupLabel: "Items selection",
                            allItemsSelectionLabel: ({ selectedItems }) =>
                              `${selectedItems.length} ${
                                selectedItems.length === 1 ? "item" : "items"
                              } selected`,
                            itemSelectionLabel: ({ selectedItems }, item) => {
                              const isItemSelected = selectedItems.filter(
                                (i) => i.name === item.name
                              ).length;
                              return `${item.name} is ${
                                isItemSelected ? "" : "not"
                              } selected`;
                            },
                          }}
                          columnDefinitions={[
                            {
                              id: "course",
                              header: "Name",
                              cell: (e) => e.Name,
                              sortingField: "name",
                              isRowHeader: true,
                            },
                            {
                              id: "state",
                              header: "State",
                              cell: (e) =>
                                e.State === "Enabled" ? (
                                  <StatusIndicator>{e.State}</StatusIndicator>
                                ) : (
                                  <StatusIndicator type="error">
                                    {e.State}
                                  </StatusIndicator>
                                ),
                              sortingField: "alt",
                            },
                            {
                              id: "level",
                              header: "Level",
                              cell: (e) => e.Level,
                            },
                            {
                              id: "views",
                              header: "Views",
                              cell: (e) => e.Views,
                            },
                            {
                              id: "creator",
                              header: "Creator",
                              cell: (e) => e.Creator,
                            },
                          ]}
                          columnDisplay={[
                            { id: "course", visible: true },
                            { id: "state", visible: true },
                            { id: "level", visible: true },
                            { id: "views", visible: true },
                            { id: "creator", visible: true },
                          ]}
                          items={topCourse}
                          loadingText="Loading resources"
                          loading={loading}
                          selectionType="multi"
                          trackBy="name"
                          empty={
                            <Box textAlign="center" color="inherit">
                              <b>No resources</b>
                              <Box
                                padding={{ bottom: "s" }}
                                variant="p"
                                color="inherit"
                              >
                                No resources to display.
                              </Box>
                              <Button>Create resource</Button>
                            </Box>
                          }
                          filter={
                            <TextFilter
                              filteringcourseThumbnail="Find Course Names"
                              filteringText=""
                            />
                          }
                          header={
                            <Header
                              counter={
                                selectedItems.length
                                  ? "(" + selectedItems.length + "/10)"
                                  : "(10)"
                              }
                            >
                              All Contributors
                            </Header>
                          }
                          pagination={
                            <Pagination currentPageIndex={1} pagesCount={2} />
                          }
                          preferences={
                            <CollectionPreferences
                              title="Preferences"
                              confirmLabel="Confirm"
                              cancelLabel="Cancel"
                              preferences={{
                                pageSize: 10,
                                contentDisplay: [
                                  { id: "Contributor Name", visible: true },
                                  { id: "Course Name", visible: true },
                                  { id: "Opp Value", visible: true },
                                  { id: "description", visible: true },
                                  { id: "userRating", visible: true },
                                ],
                              }}
                              pageSizePreference={{
                                title: "Page size",
                                options: [
                                  { value: 10, label: "10 resources" },
                                  { value: 20, label: "20 resources" },
                                ],
                              }}
                              wrapLinesPreference={{}}
                              stripedRowsPreference={{}}
                              contentDensityPreference={{}}
                              contentDisplayPreference={{
                                options: [
                                  {
                                    id: "Contributor Name",
                                    label: "Contributor Name",
                                    alwaysVisible: true,
                                  },
                                  {
                                    id: "Course Name",
                                    label: "Course Name",
                                  },
                                  { id: "Opp Value", label: "Opp Value" },
                                  { id: "description", label: "Description" },
                                  { id: "userRating", label: "userRating" },
                                ],
                              }}
                              stickyColumnsPreference={{
                                firstColumns: {
                                  title: "Stick first column(s)",
                                  description:
                                    "Keep the first column(s) visible while horizontally scrolling the table content.",
                                  options: [
                                    { label: "None", value: 0 },
                                    { label: "First column", value: 1 },
                                    { label: "First two columns", value: 2 },
                                  ],
                                },
                                lastColumns: {
                                  title: "Stick last column",
                                  description:
                                    "Keep the last column visible while horizontally scrolling the table content.",
                                  options: [
                                    { label: "None", value: 0 },
                                    { label: "Last column", value: 1 },
                                  ],
                                },
                              }}
                            />
                          }
                        />
                      </div>
                    ),
                  },
                  {
                    label: "Top Lectures",
                    id: "lectures",
                    content: "Second tab content area",
                  },
                  {
                    label: "Top Owner Lectures",
                    id: "contribute",
                    content: "Third tab content area",
                  },
                  {
                    label: "Top Opp Value",
                    id: "value",
                    content: "Third tab content area",
                  },
                ]}
              />
            </div>
          }
        />
        <Footer />
      </div>
    </>
  );
};
// export default withAuthenticator(Leaderboard);
export default Leaderboard;
