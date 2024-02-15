"use client";
import React, { useEffect, useState } from "react";
import { FaUserGroup } from "react-icons/fa6";
import { HiMiniUserGroup } from "react-icons/hi2";
import UserCard from "./cards/UserCard";
import { Skeleton } from "./ui/skeleton";
import { User } from "@/utils/interfaces/user";
import { Input } from "./ui/input";
import UserService from "@/services/userServices";
import { useUser } from "@/app/context/UserProvider";
import { Button } from "./ui/button";
import { truncateString } from "@/lib/utils";
import ChatService from "@/services/chatService";
import { toast } from "sonner";
import Chat from "@/utils/interfaces/chat";
import { UserSkeleton } from "@/utils/constants";
import { groupCollapsed } from "console";

interface AllUsersProps {}

const AllUsers: React.FC<AllUsersProps> = ({}) => {
  const [SelectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [Query, setQuery] = useState("");
  const [Users, setUsers] = useState<User[] | []>([]);
  const [Loading, setLoading] = useState<"ChatCreation" | "FetchingUsers" | "">(
    ""
  );
  const { getAuthCookie, setChat, setChats, Chats } = useUser();

  // Function to debounce the fetchUsers function
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };
  const fetchUsers = debounce(async () => {
    setLoading("FetchingUsers");
    const userService = new UserService(getAuthCookie());
    const { users } = await userService.searchUsers(Query);

    setLoading("");
    setUsers(users);
  }, 400);
  useEffect(fetchUsers, [Query]);

  function removeUserFromSelection(user: User) {
    setSelectedUsers((_) => _.filter((_) => _._id !== user._id));
  }
  function addToSelectedUsers(user: User) {
    const isSuggestionExistsInPills = SelectedUsers.find(
      (u) => u._id === user._id
    );

    if (isSuggestionExistsInPills) removeUserFromSelection(user);
    else setSelectedUsers((selectedUsers) => [...selectedUsers, user]);
  }
  const isUserSelected = (user: User) =>
    SelectedUsers.some((u) => u._id === user._id);

  let content =
    Loading === "FetchingUsers" ? (
      <UserSkeleton n={5} />
    ) : Users.length ? (
      Users.map((user) => (
        <div
          key={user._id}
          onClick={() => {
            addToSelectedUsers(user);
          }}
        >
          <UserCard
            className={isUserSelected(user) ? "ring-1 bg-gray-300" : ""}
            user={user}
          />
        </div>
      ))
    ) : (
      <p className="px-4 text-lg">
        No Users Exists Having{" "}
        <span className="font-bold text-xl">"{Query}"</span>
      </p>
    );

  async function createNewChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const chatService = new ChatService(getAuthCookie());

    if (SelectedUsers.length === 1) {
      const [selectedSingleUser] = SelectedUsers;

      setLoading("ChatCreation");
      const data = await chatService.accessChat(selectedSingleUser._id || "");
      setLoading("");
      const { message, chat } = data as { message: string; chat: Chat };
      console.log(data);
      toast.success(message);

      setChat(chat);

      // * If Chat is already created
      if (!Chats.find((c) => c._id === chat._id)) {
        setChats((chats) => [chat, ...chats]);
      }
    } else if (SelectedUsers.length >= 2) {
      // * But If Two or more users are selected, then create a group-chat, with current logged-in-user
      console.log(SelectedUsers, "create group-chat");
      const formData = new FormData(e.currentTarget);
      const groupName = formData.get("group-name")?.toString();
      console.log(groupName);
      if (!groupName) {
        toast.error("Oops! Looks like you missed entering a group name!");
        return;
      }
      setLoading("ChatCreation");
      const data = await chatService.createGroupChat(
        groupName,
        SelectedUsers.map((u) => u._id)
      );
      setLoading("ChatCreation");
      const { message, groupChat } = data;
      toast.success(message);
      console.log(groupChat);
    }
  }
  return (
    <>
      <div className="px-4 py-2">
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {SelectedUsers.map((user) => (
            <div className="flex gap-2 border-2 border-gray-300 shadow-sm rounded-full px-4 pb-1 hover:bg-gray-100 cursor-pointer ">
              <span>{truncateString(user.name)}</span>{" "}
              <span
                className="hover:text-gray-500"
                onClick={() => removeUserFromSelection(user)}
              >
                {" "}
                x
              </span>
            </div>
          ))}
          <span className="text-xs text-gray-500">
            {SelectedUsers.length > 1 ? SelectedUsers.length + 1 + " Members including (You)" : ""} 
          </span>
        </div>
        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
          }}
          className="w-full"
          placeholder="Search contacts..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Chat With Globals Users:</h2>
          <p className="text-xs text-gray-500">
            Select Any User And Start Chatting!
          </p>
        </div>
        <div className="h-[30vh] overflow-y-scroll flex flex-col gap-1">
          {content}
        </div>
      </div>
      <form
        onSubmit={createNewChat}
        className="flex flex-col px-4  py-3 gap-2 border-t"
      >
        {SelectedUsers.length > 1 && (
          <Input
            name="group-name"
            className="ring-black ring-1"
            placeholder="Your Group Name"
          />
        )}
        <Button
          disabled={!SelectedUsers.length || Loading === "ChatCreation"}
          className="w-full"
        >
          {SelectedUsers.length > 1 ? (
            <div className="flex gap-2">
              <span>New Group Chat</span>
              <HiMiniUserGroup size={21} />{" "}
            </div>
          ) : (
            <div className="flex gap-2">
              <span>New Chat</span>
              <FaUserGroup size={18} />
            </div>
          )}
        </Button>
      </form>
    </>
  );
};

export default AllUsers;
