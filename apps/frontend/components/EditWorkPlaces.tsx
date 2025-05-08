"use client";
import AddWorkPlaceDrawer from "@/components/drawer/AddWorkPlaceDrawer";
import EditWorkPlaceDrawer from "@/components/drawer/EditWorkPlaceDrawer";
import { useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { UpdateUserProfile, WorkPlace } from "@/utils";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { format } from "date-fns";
import { HistoryIcon, TrashIcon } from "lucide-react";
import React from "react";

export const columns = [
  { name: "POSITION", uid: "position" },
  { name: "COMPANY", uid: "company_name" },
  { name: "START DATE", uid: "start_date" },
  { name: "END DATE", uid: "end_date" },
  { name: "ACTIONS", uid: "actions" },
];

const EditWorkPlaces = () => {
  const {
    user,
    removeUserWorkPlace,
    workPlacesHistory,
    restoreUserWorkPlaces,
    clearEducationsHistory,
    clearWorkPlacesHistory,
    resetUserEducations,
    resetUserWorkPlaces,
  } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const { mutate: mutateUpdateProfile } = useUpdateProfile();

  const workPlaces: WorkPlace[] = (user?.work_places ?? []).map((wk) => ({
    id: wk.id,
    position: wk.position,
    company_name: wk.company_name,
    start_date: format(new Date(wk.start_date), "dd/MM/yyyy"),
    end_date: wk.end_date
      ? format(new Date(wk.end_date), "dd/MM/yyyy")
      : "Present",
  }));

  const renderCell = React.useCallback(
    (workPlace: WorkPlace, columnKey: React.Key) => {
      const cellValue = workPlace[columnKey as keyof WorkPlace];

      switch (columnKey) {
        case "actions":
          return (
            <div className="flex items-center justify-center md:gap-3 gap-2">
              <EditWorkPlaceDrawer workPlace={workPlace} />

              <Tooltip content="Delete">
                <TrashIcon
                  className="cursor-pointer focus:outline-none"
                  onClick={() => {
                    removeUserWorkPlace(workPlace.id);
                  }}
                />
              </Tooltip>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [removeUserWorkPlace],
  );

  const handleUpdate = () => {
    const updateUserProfileDto: UpdateUserProfile = {
      workPlaces: user?.work_places,
    };

    mutateUpdateProfile(updateUserProfileDto);
  };

  const handleCancel = () => {
    setIsModalEditProfileOpen(false);

    setTimeout(() => {
      resetUserEducations();
      resetUserWorkPlaces();
      clearEducationsHistory();
      clearWorkPlacesHistory();
    }, 1000);
  };

  return (
    <main className="flex flex-col md:gap-3 gap-2">
      {user?.work_places?.length !== 0 ? (
        <>
          <Table
            aria-label="work-places"
            className="shadow-none w-full"
            isCompact
            isStriped
          >
            <TableHeader columns={columns} className="select-none">
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={workPlaces} emptyContent="Empty Work Places">
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      ) : (
        <h1 className="text-gray-700 md:text-medium text-sm text-center">
          Empty Work Places
        </h1>
      )}

      {workPlacesHistory.length !== 0 && (
        <Tooltip content="Undo">
          <div className="flex items-center justify-center">
            <HistoryIcon
              className="focus:outline-none cursor-pointer"
              onClick={restoreUserWorkPlaces}
            />
          </div>
        </Tooltip>
      )}

      <div className="flex flex-col items-center md:gap-2 gap-1 w-full">
        <AddWorkPlaceDrawer />

        <div className="flex items-center justify-center md:gap-3 gap-2">
          <Button color="primary" onPress={handleCancel}>
            Cancel
          </Button>

          <Button color="primary" onPress={handleUpdate}>
            Update
          </Button>
        </div>

        <p className="text-center text-gray-700 italic text-sm">
          Note: Click the Update button to save the changes you just made.
        </p>
      </div>
    </main>
  );
};

export default EditWorkPlaces;
