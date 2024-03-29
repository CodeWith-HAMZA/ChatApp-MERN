"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import UserService from "@/services/userServices";
import { cookies } from "next/headers";
import { useUser } from "@/app/context/UserProvider";
import { Skeleton } from "./ui/skeleton";
import UserCard from "./cards/UserCard";
import { User } from "@/utils/interfaces/user";
import AllUsers from "./AllUsers";
import { MdAdd } from "react-icons/md";
export default function CreateNewChat() {
  return (
    <>
      <Drawer>
        <DrawerTrigger className="flex justify-center gap-1 items-center  text-white bg-black hover:bg-opacity-80 w-full px-3 py-2 rounded-md  bg-opacity-90 transition-all">
          <span className="">New Chat</span>
          <MdAdd size={20} />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <div className="flex dark:bg-black bg-white dark:text-white flex-col h-full">
            <AllUsers />
          </div>

          <DrawerFooter>
            {/* <Button>Submit</Button> */}
            <DrawerClose>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
