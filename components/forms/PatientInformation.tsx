import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RadioButton from "../ui/RadioButton";
import CustomDatePicker from "../ui/DatePicker";
import { Checkbox } from "../ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { Separator } from "../ui/separator";

export default function PatientInformation() {
  const [formData, setFormData] = useState({
    document: "",
    email: "",
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "M",
    isDependent: false,
    dependentFirstName: "",
    dependentLastName: "",
    dependentDateOfBirth: new Date(),
    dependentGender: "M",
  });

  const handleDependentChange = () => {
    setFormData((prev) => ({ ...prev, isDependent: !prev.isDependent }));
  };

  const handleGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleDependentGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, dependentGender: value }));
  };

  return (
    <div className="border p-6 rounded-md shadow-md space-y-6">
      <h2 className="text-lg font-bold mb-4">Patient Information</h2>
      <div className="grid gap-4 md:grid-cols-1">
        <div className="flex flex-row">
          <Input
            name="document"
            label="Document"
            placeholder="Enter document"
            value={formData.document}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, document: e.target.value }))
            }
            className="w-full lg:w-1/3"
          />
          <Button type="submit" className="w-16 self-end mx-4">
            Verify
          </Button>
        </div>
      </div>
      <Input
        name="email"
        label="Email"
        placeholder="Enter email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        className="w-full lg:w-1/3"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
          }
          className="w-full"
        />
        <Input
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
          }
          className="w-full"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <CustomDatePicker
            label="Date of Birth"
            selectedDate={formData.dateOfBirth}
            onDateChange={(date) =>
              setFormData((prev) => ({
                ...prev,
                dateOfBirth: date ?? new Date(),
              }))
            }
            className="h-16"
          />
          <CalendarIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <h4>Gender</h4>
          <RadioButton
            label="M"
            value="M"
            checked={formData.gender === "M"}
            onChange={() => handleGenderChange("M")}
            className="py-2 px-4 border rounded-md text-center bg-blue-500 hover:bg-gray-300"
          />
          <RadioButton
            label="F"
            value="F"
            checked={formData.gender === "F"}
            onChange={() => handleGenderChange("F")}
            className="py-2 px-4 border rounded-md text-center bg-blue-500 hover:bg-gray-300"
          />
        </div>
      </div>
      <Checkbox
        label="The patient is dependent"
        checked={formData.isDependent}
        onChange={handleDependentChange}
        className="mt-4"
      />
      {formData.isDependent && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-bold mb-4">Dependent Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="dependentFirstName"
              label="First Name"
              placeholder="Enter first name"
              value={formData.dependentFirstName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dependentFirstName: e.target.value,
                }))
              }
              className="w-full"
            />
            <Input
              name="dependentLastName"
              label="Last Name"
              placeholder="Enter last name"
              value={formData.dependentLastName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dependentLastName: e.target.value,
                }))
              }
              className="w-full"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="relative">
              <CustomDatePicker
                label="Date of Birth"
                selectedDate={formData.dependentDateOfBirth}
                onDateChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    dependentDateOfBirth: date ?? new Date(),
                  }))
                }
                className="h-16"
              />
              <CalendarIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <h4>Gender</h4>
              <RadioButton
                label="M"
                value="M"
                checked={formData.dependentGender === "M"}
                onChange={() => handleDependentGenderChange("M")}
                className="py-2 px-4 border rounded-md text-center bg-blue-500 hover:bg-gray-300"
              />
              <RadioButton
                label="F"
                value="F"
                checked={formData.dependentGender === "F"}
                onChange={() => handleDependentGenderChange("F")}
                className="py-2 px-4 border rounded-md text-center bg-blue-500 hover:bg-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
