import React, { useState } from "react";
import { Input } from "../ui/Input";
import { RadioGroup } from "../ui/RadioGroup";
import CustomDatePicker from "../ui/DatePicker";

export default function DependentInformation() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<"M" | "F">("M"); // Default to "M"

  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-lg font-bold">Dependent Information</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Input
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2"
          />
          <Input
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2"
          />
        </div>
        <div className="flex space-x-4">
          <CustomDatePicker
            label="Date of Birth"
            selectedDate={dateOfBirth ?? new Date()} // Default to today if null
            onDateChange={(date) => setDateOfBirth(date)}
            className="w-1/2"
          />
          <RadioGroup
            title="Gender"
            options={[
              { title: "M", value: "M" },
              { title: "F", value: "F" },
            ]}
            selectedValue={gender}
            onChange={(value) => setGender(value as "M" | "F")}
            className="w-1/2"
          />
        </div>
      </div>
    </div>
  );
}
