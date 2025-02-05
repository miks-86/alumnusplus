import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { EditorState, convertToRaw } from "draft-js";
import {
  FiBold,
  FiHeart,
  FiItalic,
  FiLoader,
  FiMoreHorizontal,
  FiShare2,
  FiUnderline,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useRealtime, useSelect } from "react-supabase";

import FeedCardNew from "../../components/FeedCardNew";
import FeedRecomUserNew from "../../components/FeedRecomUserNew";
import Head from "next/head";
import RichTextEditor from "../../components/RichTextEditor";
import { __PageTransition } from "../../lib/animtions";
import __supabase from "../../lib/supabase";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

// const Editor = dynamic(
//   () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
//   {
//     ssr: false,
//   }
// );

const Feed = ({}) => {
  const [feed, setFeed] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);

  const checkUser = async () => {
    const user = __supabase.auth.user();
    if (!user) {
      router.push("/");
    } else {
      setUser(user);
    }
  };
  const [
    { data: feedData, error: feedError, fetching: feedLoading },
    FeedReExecute,
  ] = useRealtime("hunt_blog", {
    columns: "*",
    order: "created_at",
  });

  const [
    { data: recomUserData, error: recomUserError, fetching: recomUserLoading },
  ] = useSelect("random_hunters", {
    columns: "id,created_at,username,firstName,lastName",
    order: "created_at",
    limit: 5,
  });

  if (feedError) {
    toast.error(error.message);
    FeedReExecute();
  }

  const filterFeed = async () => {
    const user = __supabase.auth.user();
    const connections = user.user_metadata.connections;

    const filtered = feedData.filter((e) => {
      if (
        (connections && connections.includes(e.uploader_email)) ||
        e.uploader_email === user.email
      ) {
        return e;
      }
    });
    setFeed(filtered);
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (feedData) {
      filterFeed();
    }

    if (recomUserData) {
      const token = localStorage.getItem("supabase.auth.token");
      const parsedToken = JSON.parse(token);
      const user = parsedToken.currentSession.user;
      const connections = user.user_metadata.connections;
      const filtered = connections
        ? recomUserData.filter((e) => {
            return !connections.includes(e.id) && e.id !== user.id;
          })
        : recomUserData;

      setRecommendedUsers(filtered);
    }
  }, [feedData, recomUserData]);

  if (!user || !feed || !recommendedUsers || feedLoading || recomUserLoading) {
    return (
      <motion.div
        variants={__PageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed top-0 left-0 flex flex-col justify-center items-center w-full min-h-screen"
      >
        <FiLoader className="animate-spin text-xl" />
      </motion.div>
    );
  }

  return (
    <>
      <Head>
        <title>Feed | Wicket</title>
      </Head>

      <motion.main
        variants={__PageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pb-16 lg:pt-24 pt-36"
      >
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-full lg:col-span-3 flex flex-col gap-10">
            <div className="flex w-full gap-2">
              <img
                src={`https://dicebear.com/api/micah/${user.user_metadata.username}.svg`}
                className="w-12 h-12 rounded-full bg-base-300"
              />

              <div className="flex flex-col gap-2 rounded-box w-full">
                {/* <div className="p-3 bg-base-300 bg-opacity-40 rounded-box"> */}
                {/* editor */}
                {/* <Editor
                    toolbarHidden
                    editorClassName="bg-transparent gap-0"
                    onEditorStateChange={(e) => {
                      let raw = convertToRaw(e.getCurrentContent());
                      setPostContent(raw);
                    }}
                  /> */}
                {/* </div> */}

                <RichTextEditor />
                {/* <button
                  onClick={handlePost}
                  className="btn btn-primary btn-sm mt-5"
                >
                  Post
                </button> */}
              </div>
            </div>

            {recommendedUsers.length > 0 && (
              <div className="flex flex-col gap-5 lg:hidden">
                <p className="text-lg font-semibold">Recommended Users</p>
                <div className="flex flex-col gap-5">
                  {recommendedUsers.map((e, index) => {
                    if (index < 3) {
                      return (
                        <FeedRecomUserNew user={e} key={`recom_user${index}`} />
                      );
                    }
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col border border-primary border-opacity-50 rounded-box overflow-hidden ">
              {feed.map((item, index) => (
                <FeedCardNew feedItem={item} key={`feed_item${index}`} />
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2 sticky top-24 h-max">
            {recommendedUsers.length > 0 && (
              <>
                <p className="text-xl font-semibold">Recommended Users</p>
                <div className="flex flex-col mt-6 gap-3">
                  {recommendedUsers.map((e, index) => {
                    if (index < 5) {
                      return (
                        <FeedRecomUserNew user={e} key={`recom_user${index}`} />
                      );
                    }
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default Feed;
