import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
// import { withAuthenticator } from '@aws-amplify/ui-react';

import SideNavigation from "@cloudscape-design/components/side-navigation";
import Applayout from "@cloudscape-design/components/app-layout";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
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
  lecturePath,
  lectureTopViewPath,
  contributorPath,
  topContributorPath,
  courseOppPath,
  topOppValuePath,
} from "../../utils/api";
import "./Leaderboard.css";

const Leaderboard = (props) => {
  const [activeHref, setActiveHref] = useState("leaderboard");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [topCourse, setTopCourse] = useState([]);
  const [topLectures, setTopLectures] = useState([]);
  const [topContributor, setTopContributor] = useState([]);
  const [topCourseOppValue, setTopCourseOppValue] = useState([]);
  const [activeTabId, setActiveTabId] = useState("courses");
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTabId === "courses") {
      getTopCourse();
    } else if (activeTabId === "lectures") {
      getTopLecture();
    } else if (activeTabId === "contributor"){
      getContributor();
    } else {
      getTopOppValue();
    }
  }, [activeTabId]);

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
        topCourseTemp[i]["Creator"] = response.UserAttributes[2].Value;
        i++;
      }
      setTopCourse(topCourseTemp);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getTopLecture = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, lecturePath + lectureTopViewPath);
      let i = 0;
      const userPoolId = Auth.userPool.userPoolId;
      let topLectureTemp = [...data];
      while (i < data.length) {
        const response = await API.get(
          apiName,
          userPath +
            byUserName +
            `?username=${data[i].CreatorID}&userPoolId=${userPoolId}`
        );
        console.log(response);
        topLectureTemp[i]["Creator"] = response.UserAttributes[2].Value;
        i++;
      }
      setTopLectures(topLectureTemp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getContributor = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, contributorPath + topContributorPath);
      const userPoolId = Auth.userPool.userPoolId;
      let topContributorTemp = [...data];
      let i = 0;
      while (i < data.length) {
        const response = await API.get(
          apiName,
          userPath +
            byUserName +
            `?username=${data[i].contributorID}&userPoolId=${userPoolId}`
        );
        console.log(response);
        topContributorTemp[i]["Creator"] = response.UserAttributes[2].Value;
        i++;
      }
      setTopContributor(topContributorTemp);
      setLoading(false);
    }catch(error){
      setLoading(false);
      console.log(error);
    }
  }

  const getTopOppValue = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, courseOppPath + topOppValuePath);
      console.log(data)
      setTopCourseOppValue(data);
      setLoading(false);
    }catch(error){
      setLoading(false);
      console.log(error);
    }
  }

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
              <Tabs
                onChange={(detail) =>
                  setActiveTabId(detail.detail.activeTabId)
                }
                // activeTabId={activeTabId}
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
                                  { id: "course", visible: true },
                                  { id: "state", visible: true },
                                  { id: "level", visible: true },
                                  { id: "views", visible: true },
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
                                    id: "course",
                                    label: "Name",
                                    alwaysVisible: true,
                                  },
                                  { id: "state", label: "State" },
                                  { id: "level", label: "Level" },
                                  { id: "views", label: "Views" },
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
                            { id: "creator", visible: true }
                          ]}
                          items={topLectures}
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
                                  { id: "course", visible: true },
                                  { id: "state", visible: true },
                                  { id: "level", visible: true },
                                  { id: "views", visible: true },
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
                                    id: "course",
                                    label: "Name",
                                    alwaysVisible: true,
                                  },
                                  { id: "state", label: "State" },
                                  { id: "level", label: "Level" },
                                  { id: "views", label: "Views" },
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
                    label: "Top Owner Courses",
                    id: "contributor",
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
                              id: "creator",
                              header: "Creator",
                              cell: (e) => e.Creator,
                            },
                            {
                              id: "courseNumber",
                              header: "Number of courses",
                              cell: (e) => e.coursesNum,
                              sortingField: "name",
                              isRowHeader: true,
                            },
                            {
                              id: "views",
                              header: "Views",
                              cell: (e) => e.views,
                            },
                          ]}
                          columnDisplay={[
                            { id: "creator", visible: true },
                            { id: "courseNumber", visible: true },
                            { id: "views", visible: true }
                          ]}
                          items={topContributor}
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
                                  { id: "course", visible: true },
                                  { id: "state", visible: true },
                                  { id: "level", visible: true },
                                  { id: "views", visible: true },
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
                                    id: "course",
                                    label: "Name",
                                    alwaysVisible: true,
                                  },
                                  { id: "state", label: "State" },
                                  { id: "level", label: "Level" },
                                  { id: "views", label: "Views" },
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
                    label: "Top Opp Value",
                    id: "oppValue",
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
                              id: "name",
                              header: "Course Name",
                              cell: (e) => e.CourseName,
                            },
                            {
                              id: "value",
                              header: "Opportunity Value",
                              cell: (e) => e.OppValue,
                              sortingField: "name",
                              isRowHeader: true,
                            },
                          ]}
                          columnDisplay={[
                            { id: "name", visible: true },
                            { id: "value", visible: true },
                          ]}
                          items={topCourseOppValue}
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
                                  { id: "course", visible: true },
                                  { id: "state", visible: true },
                                  { id: "level", visible: true },
                                  { id: "views", visible: true },
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
                                    id: "course",
                                    label: "Name",
                                    alwaysVisible: true,
                                  },
                                  { id: "state", label: "State" },
                                  { id: "level", label: "Level" },
                                  { id: "views", label: "Views" },
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
