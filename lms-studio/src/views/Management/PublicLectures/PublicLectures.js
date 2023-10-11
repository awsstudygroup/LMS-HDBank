import React, { useEffect, useState } from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Title from "../../../components/Title";
import { transformDateTime } from "../../../utils/tool";
import { apiName, lecturePublicPath } from "../../../utils/api";
import { API, Storage } from "aws-amplify";
import { getPublicLecturesService } from "../services/lecture";

const PublicLectures = () => {
  const [selectedItems, setSelectedItems] = React.useState([]);

  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(false)

  const handleGetLectures = async () => {
    setLoading(true)

    // try {
    // const {data} = await getPublicLecturesService()
    // setLectures(data)
    // setLoading(false)
    // } catch(_) {
    //   setLoading(false)
    // }
    try {
      const data = await API.get(apiName, lecturePublicPath);
      setLectures(data);
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleGetLectures()
  },[])

  return (
    <>
      {/* <Title text="Public Lectures" /> */}
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
              (i) => i.Name === item.Name
            ).length;
            return `${item.Name} is ${isItemSelected ? "" : "not"} selected`;
          },
        }}
        columnDefinitions={[
          {
            id: "Name",
            header: "Lecture name",
            cell: (e) => e.Name,
            sortingField: "name",
            isRowHeader: true,
          },
          {
            id: "updatedAt",
            header: "Last Updated",
            cell: (lecture) =>
              lecture.LastUpdated ? transformDateTime(lecture.LastUpdated) : "",
            sortingField: "name",
          },
          {
            id: "state",
            header: "State",
            cell: (e) =>
              e.State === "Enabled" ? (
                <StatusIndicator>{e.State}</StatusIndicator>
              ) : (
                <StatusIndicator type="error">{e.State}</StatusIndicator>
              ),
            sortingField: "state",
          },
        ]}
        columnDisplay={[
          { id: "Name", visible: true },
          { id: "updatedAt", visible: true },
          { id: "state", visible: true },
        ]}
        items={lectures}
        loading={loading}
        loadingText="Loading resources"
        selectionType="multi"
        trackBy="Name"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
            <Button>Create resource</Button>
          </Box>
        }
        filter={
          <div className="input-container">
            <TextFilter filteringPlaceholder="Find resources" filteringText="" />
          </div>
        }
        header={
          <Header
            counter={
              selectedItems.length
                ? "(" + selectedItems.length + `/${lectures.length})`
                : `(${lectures.length})`
            }
          >
            Public Lectures
          </Header>
        }
        pagination={<Pagination currentPageIndex={1} pagesCount={2} />}
      />
    </>
  );
};

export default PublicLectures;
