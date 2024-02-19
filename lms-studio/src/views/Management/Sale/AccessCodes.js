import React, { useState, useEffect } from "react";
import {
  AppLayout,
  BreadcrumbGroup,
  SideNavigation,
  Container,
  Header,
  ColumnLayout,
  SpaceBetween,
  Toggle,
  Box,
  Input,
  Table,
  TextFilter,
  Pagination,
  CollectionPreferences,
  Button,
  Flashbar,
} from "@cloudscape-design/components";
import { useNavigate, useLocation } from "react-router-dom";
import { API } from "aws-amplify";
import NavBar from "../../../components/NavBar/NavBar";
import { apiName, accessCodePath } from "../../../utils/api";
import Footer from "../../../components/Footer/Footer";

export default function AccessCodes(props) {
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const getAllAccessCode = async () => {
    setLoading(true)
    try {
      const response = await API.get(apiName, "courses/addAc/solution-architecture-association");
      console.log(response);
      setAccessCode(response)
      setLoading(false)
    }catch(error){
      console.log(error);
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllAccessCode();
  }, []);

  return (
    <>
      <Table
        onSelectionChange={({ detail }) => {
          // if (detail.selectedItems.length > 1) {
          //   setEditDisable(true);
          // }
          // detail.selectedItems.length > 0
          //   ? setActionDisable(false)
          //   : setActionDisable(true);
          setSelectedItems(detail.selectedItems);
        }}
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
            //console.log(`item is ${isItemSelected}`);
            return `${item.Name} is ${isItemSelected ? "" : "not"} selected`;
          },
        }}
        columnDefinitions={[
          {
            id: "info",
            header: "Opp Info",
            cell: (e) => e.Info,
            sortingField: "Info",
          },
          {
            id: "access_code",
            header: "Access Code",
            cell: (e) => e.AccessCode,
            sortingField: "Info",
            isRowHeader: true,
          },
          {
            id: "value",
            header: "Value",
            minWidth: 100,
            cell: (e) => e.Value,
          },
        ]}
        columnDisplay={[
          { id: "info", visible: true },
          { id: "access_code", visible: true },
          { id: "value", visible: true },
        ]}
        items={accessCode}
        loading={loading}
        loadingText="Loading resources"
        selectionType="multi"
        trackBy="Info"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
            <Button>Create access code</Button>
          </Box>
        }
        filter={
          <div className="input-container">
            <TextFilter filteringPlaceholder="Find resources" filteringText="" />
          </div>
        }
        header={
          <div className="header">
          <Header
            counter={
              selectedItems.length
                ? "(" + selectedItems.length + `/${accessCode.length})`
                : `(${accessCode.length})`
            }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary" href="#/management/sale/generateCode">
                  Generate code
                </Button>
              </SpaceBetween>
            }
          >
            Access codes
          </Header>
          </div>
        }
        pagination={<Pagination currentPageIndex={1} pagesCount={2}  />}
      />
    </>
  );
}
