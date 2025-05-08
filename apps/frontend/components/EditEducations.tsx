"use client";
import AddEducationDrawer from "@/components/drawer/AddEducationDrawer";
import EditEducationDrawer from "@/components/drawer/EditEducationDrawer";
import { useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { Education, UpdateUserProfile } from "@/utils";
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
  { name: "MAJOR", uid: "major" },
  { name: "DEGREE", uid: "degree" },
  { name: "SCHOOL", uid: "school_name" },
  { name: "START DATE", uid: "start_date" },
  { name: "END DATE", uid: "end_date" },
  { name: "ACTIONS", uid: "actions" },
];

const EditEducations: React.FC = () => {
  const {
    user,
    resetUserEducations,
    removeUserEducation,
    restoreUserEducations,
    clearEducationsHistory,
    clearWorkPlacesHistory,
    resetUserWorkPlaces,
    educationsHistory,
  } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const { mutate: mutateUpdateProfile } = useUpdateProfile();

  const educations: Education[] = (user?.educations ?? []).map((ed) => ({
    id: ed.id,
    major: ed.major,
    degree: ed.degree,
    school_name: ed.school_name,
    start_date: format(new Date(ed.start_date), "dd/MM/yyyy"),
    end_date: ed.end_date
      ? format(new Date(ed.end_date), "dd/MM/yyyy")
      : "Present",
  }));

  const renderCell = React.useCallback(
    (education: Education, columnKey: React.Key) => {
      const cellValue = education[columnKey as keyof Education];

      switch (columnKey) {
        case "actions":
          return (
            <div className="flex items-center justify-center md:gap-3 gap-2">
              <EditEducationDrawer education={education} />

              <Tooltip content="Delete">
                <TrashIcon
                  className="cursor-pointer focus:outline-none"
                  onClick={() => {
                    removeUserEducation(education.id);
                  }}
                />
              </Tooltip>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [removeUserEducation],
  );

  const handleUpdate = () => {
    const updateUserProfile: UpdateUserProfile = {
      educations: user?.educations,
    };

    mutateUpdateProfile(updateUserProfile);
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
      {user?.educations?.length !== 0 ? (
        <Table
          aria-label="educations"
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
          <TableBody items={educations} emptyContent="Empty Educations">
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <h1 className="text-gray-700 md:text-medium text-sm text-center">
          Empty Educations
        </h1>
      )}

      {educationsHistory.length !== 0 && (
        <Tooltip content="Undo">
          <div className="flex items-center justify-center">
            <HistoryIcon
              className="focus:outline-none cursor-pointer"
              onClick={restoreUserEducations}
            />
          </div>
        </Tooltip>
      )}

      <div className="flex flex-col items-center md:gap-2 gap-1 w-full">
        <AddEducationDrawer />

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

export default EditEducations;
