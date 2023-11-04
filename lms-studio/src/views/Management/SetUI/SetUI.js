import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  BreadcrumbGroup,
  Wizard,
  FormField,
  Input,
  Container,
  Modal,
  Header,
  SpaceBetween,
  Button,
  Form,
  Box,
  FileUpload,
  Table,
  TextFilter,
  Textarea,
  Alert,
  Pagination,
  CollectionPreferences,
  Flashbar,
  Icon,
  ExpandableSection,
  Select,
} from "@cloudscape-design/components";
export default function SetUI() {
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
          // setSelectedItems(detail.selectedItems);
        }}
        selectedItems={[]}
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
        items={[]}
        // loading={loading}
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
            // counter={
            //   selectedItems.length
            //     ? "(" + selectedItems.length + `/${accessCode.length})`
            //     : `(${accessCode.length})`
            // }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary" href="/#/createSetUI">
                  Create new UI
                </Button>
              </SpaceBetween>
            }
          >
            UI Set
          </Header>
          </div>
        }
        pagination={<Pagination currentPageIndex={1} pagesCount={2}  />}
      />
    </>
  );
}
