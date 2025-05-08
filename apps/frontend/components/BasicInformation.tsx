"use client";
import { useUserStore } from "@/store";
import { GenderEnum } from "@repo/db";
import {
  Calendar,
  CircleHelp,
  Mail,
  MapPinHouse,
  Mars,
  Phone,
  Venus,
} from "lucide-react";
import React from "react";
import { format } from "date-fns";

const genderMap = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const BasicInformation = () => {
  const { user } = useUserStore();

  const details =
    user && user.profile
      ? [
          {
            key: 1,
            icon: <Mail />,
            value: user.email,
          },
          {
            key: 2,
            icon: <Phone />,
            value: user.profile.phone_number,
          },
          {
            key: 3,
            icon:
              user.profile.gender === GenderEnum.female ? (
                <Venus />
              ) : user.profile.gender === GenderEnum.male ? (
                <Mars />
              ) : (
                <CircleHelp />
              ),
            value: genderMap[user.profile.gender],
          },
          {
            key: 4,
            icon: <MapPinHouse />,
            value: user.profile.address,
          },
          {
            key: 5,
            icon: <Calendar />,
            value: format(new Date(user.profile.dob), "dd/MM/yyyy"),
          },
        ]
      : [];

  return (
    <>
      {details?.length && (
        <div className="flex flex-col md:gap-3 gap-2">
          {details.map((d) => (
            <div key={d.key} className="flex items-center md:gap-2 gap-1">
              {d.icon}

              <p>{d.value}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default BasicInformation;
