import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowDown,
  FiChevronsDown,
  FiFilter,
  FiHeart,
  FiLoader,
  FiMessageCircle,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPlusCircle,
  FiSearch,
  FiShare2,
  FiUserPlus,
  FiX
} from "react-icons/fi";
import { useClient, useFilter, useRealtime, useSelect } from "react-supabase";

import { $schema_blog } from "../../schemas/blog";
import FeedCard from "./FeedCard";
import Image from "next/image";
import Link from "next/link";
import { __PageTransition } from "../../lib/animtions";
import __supabase from "../../lib/supabase";
import dayjs from "dayjs";
import reactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState } from "react";
import uuidv4 from "../../lib/uuidv4";

const FeedPage = () => {
  const [blogContent, setBlogContent] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterMode, setFilterMode] = useState("content");
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const supabaseClient = useClient();
  const router = useRouter();

  const feedFilter = useFilter(
    (query) => query.order("createdAt", { ascending: false }),
    []
  );

  const randomHunterFilter = useFilter((query) =>
    query.not("email", "eq", __supabase.auth.user().email)
  );

  const [
    {
      count: blogCount,
      data: blogData,
      error: blogError,
      fetching: blogLoading
    },
    reexecuteHunterBlog
  ] = useSelect("hunt_blog", { filter: feedFilter });

  const [
    {
      data: randomHunters,
      error: randomHuntersError,
      fetching: randomHuntersLoading
    },
    reexecuteRandomHunters
  ] = useSelect("recommended_hunters", {
    filter: randomHunterFilter
  });

  const addPost = async (e) => {
    e.preventDefault();

    if (blogContent.length < 5) {
      toast.error("Please enter some content");
      return;
    }

    const user = await __supabase.auth.user();
    const uploaderMetadata = user.user_metadata;

    toast.loading("Uploading post...");

    const schema = $schema_blog;

    schema.type = "blog";
    schema.id = uuidv4();
    schema.content = blogContent;
    schema.comments = [];
    schema.upvoters = [];
    schema.createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    schema.updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    schema.uploaderID = user.id;
    schema.uploader = {
      id: user.id,
      username: uploaderMetadata.username,
      firstName: uploaderMetadata.fullname.first,
      lastName: uploaderMetadata.fullname.last,
      middleName: uploaderMetadata.fullname.middle,
      email: user.email,
      type: "hunter"
    };

    // console.log(schema);

    const { error } = await __supabase.from("hunt_blog").insert(schema);

    toast.dismiss();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post uploaded!");
      setBlogContent("");
      setCreatePostModalOpen(false);
      reexecuteHunterBlog();
    }
  };

  if (blogLoading) {
    return (
      <motion.main
        variants={__PageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed w-full h-screen flex flex-col justify-center items-center top-0 left-0"
      >
        <FiLoader className="animate-spin text-4xl " />
        <p>Loading...</p>
      </motion.main>
    );
  }

  const filterPostHandler = (e) => {
    const input = e.target.value;
    if (input.length >= 3) {
      const filtered =
        filterMode === "content"
          ? blogData.filter((post) =>
              post.content.toLowerCase().includes(input.toLowerCase())
            )
          : filterMode === "uploader_email"
          ? blogData.filter((post) =>
              post.uploader_email.toLowerCase().includes(input.toLowerCase())
            )
          : filterMode === "username"
          ? blogData.filter((post) =>
              post.uploaderData.username
                .toLowerCase()
                .includes(input.toLowerCase())
            )
          : filterMode === "fullname"
          ? blogData.filter(
              (post) =>
                post.uploaderData.firstName
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                post.uploaderData.lastName
                  .toLowerCase()
                  .includes(input.toLowerCase())
            )
          : blogData.filter((post) =>
              post.content.toLowerCase().includes(input.toLowerCase())
            );

      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  };

  return (
    !blogLoading &&
    blogData && (
      <>
        <motion.main
          variants={__PageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-3 gap-4 pt-24 pb-36"
        >
          {/* feed */}
          <div className="col-span-2 flex flex-col gap-16">
            {/* create post */}
            <div className="flex flex-col-reverse lg:flex-row lg:items-center gap-4">
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="btn btn-primary gap-2 btn-sm lg:btn-md w-full max-w-md lg:w-max"
              >
                <FiPlusCircle className="text-xl" />
                <p>Create Post</p>
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const searchQuery = e.target[0].value;
                  if (searchQuery.length >= 5) {
                    // trim last whitespace
                    const trimmedQuery = searchQuery.trim();
                    // make the searchQuery URL friendly
                    const urlFriendlyQuery = trimmedQuery.replace(/\s/g, "+");
                    // redirect to search page
                    router.push(`/search?query=${urlFriendlyQuery}`);
                  } else {
                    toast.error("Please enter a valid search query");
                  }
                }}
                className="w-full input-group"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-primary input-sm lg:input-md w-full max-w-md"
                />
                <span>
                  <FiSearch />
                </span>
              </form>
            </div>

            {/* cards */}
            {filteredPosts.length >= 1
              ? filteredPosts.map((blog, index) => (
                  <FeedCard
                    key={`feedcard_${index + 1}`}
                    feedData={blog}
                    index={index}
                  />
                ))
              : blogData?.map((blog, index) => (
                  <FeedCard
                    key={`feedcard_${index + 1}`}
                    feedData={blog}
                    index={index}
                  />
                ))}
          </div>

          {/* sidebar */}
          <div className="hidden lg:flex flex-col gap-4 relative max-h-screen">
            <div className="flex flex-col p-4 bg-base-200 bg-opacity-75 gap-2 rounded-btn sticky top-10">
              <p className="text-lg font-bold ml-2 mb-4">Recommended Hunters</p>
              {!randomHuntersLoading ? (
                randomHunters.map((hunter, index) => (
                  <div className="p-3 bg-base-300 rounded-btn flex items-center gap-3">
                    <Image
                      src={`https://avatars.dicebear.com/api/bottts/${hunter.username}.svg`}
                      width={30}
                      height={30}
                    />
                    <div>
                      <Link
                        href={`/hunter/${hunter.username}`}
                        className="text-sm font-semibold leading-none"
                      >
                        {hunter.fullname.first} {hunter.fullname.last}
                      </Link>
                      <p className="text-xs opacity-50 leading-none">
                        @{hunter.username}
                      </p>
                    </div>
                    <div className=" ml-auto">
                      <button className="btn btn-ghost btn-sm btn-circle">
                        <FiUserPlus className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </motion.main>

        {/* add post modal */}
        <AnimatePresence key={"createPostModal"}>
          {createPostModalOpen && (
            <motion.div
              key={`createPostModal_${createPostModalOpen}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3, ease: "circOut" }
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3, ease: "circIn" }
              }}
              className="fixed w-full h-screen bg-base-300 bg-opacity-80 top-0 left-0"
              onClick={(e) => {
                if (e.currentTarget === e.target) {
                  setCreatePostModalOpen(false);
                }
              }}
            >
              <motion.div
                initial={{
                  clipPath: "inset(0 0 100% 0)",
                  y: "-50px"
                }}
                animate={{
                  clipPath: "inset(0 0 0% 0)",
                  y: "0px",
                  transition: { duration: 0.3, ease: "circOut" }
                }}
                exit={{
                  clipPath: "inset(100% 0 0% 0)",
                  y: "50px",
                  transition: { duration: 0.3, ease: "circIn" }
                }}
                className="absolute w-full max-w-xl h-screen max-h-screen overflow-y-auto top-0 left-0 bg-base-100 py-36 lg:py-24 px-5"
              >
                <div className="modal-title flex justify-between items-center">
                  <h5>
                    Add Post as{" "}
                    <span className="text-secondary underline underline-offset-4">
                      {supabaseClient.auth.user().user_metadata?.username}
                    </span>
                  </h5>
                  <div
                    className="btn btn-ghost btn-circle"
                    onClick={() => setCreatePostModalOpen(false)}
                  >
                    <FiX />
                  </div>
                </div>
                <div className="modal-body flex flex-col gap-2">
                  <form onSubmit={(e) => addPost(e)}>
                    <textarea
                      name="content"
                      className="textarea textarea-bordered w-full"
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${
                          e.target.scrollHeight + 8
                        }px`;

                        const content = e.target.value;
                        const newContent = content.replace(/\n/g, "<br />");
                        setBlogContent(newContent);
                      }}
                    />
                    <p
                      onClick={() => {
                        setCheatSheetOpen(!cheatSheetOpen);
                      }}
                      className="text-sm mt-2 flex items-center gap-2 cursor-pointer hover:link"
                    >
                      {cheatSheetOpen ? "Close" : "Open"} markdown cheatsheet{" "}
                      <span>
                        <FiArrowDown />
                      </span>
                    </p>
                    {
                      // markdown cheatsheet
                      cheatSheetOpen && (
                        <div className="grid grid-cols-2 mt-4 gap-3">
                          <p>
                            <strong>Headers</strong>
                            <br />
                            # H1
                            <br />
                            ## H2
                            <br />
                            ### H3
                          </p>
                          <p>
                            <strong>Emphasis</strong>
                            <br />
                            *italic* or _italic_
                            <br />
                            **bold** or __bold__
                            <br />
                            ~~strikethrough~~
                          </p>
                          <p>
                            <strong>Lists</strong>
                            <br />
                            - Unordered list
                            <br />
                            1. Ordered list
                          </p>
                          <p>
                            <strong>Links</strong>
                            <br />
                            [Link](https://supabase.io)
                          </p>
                          <p>
                            <strong>Code</strong>
                            <br />
                            `code`
                          </p>
                          <p>
                            <strong>Blockquotes</strong>
                            <br />
                            {">"} Blockquote
                          </p>
                          <p>
                            <strong>Horizontal Rule</strong>
                            <br />
                            ---
                          </p>
                        </div>
                      )
                    }
                    <div className="modal-action">
                      <label
                        onClick={() => setCreatePostModalOpen(false)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </label>
                      <button type="submit" className="btn btn-primary">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  );
};

export default FeedPage;
