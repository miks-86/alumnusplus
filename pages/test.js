import { AnimatePresence, motion } from "framer-motion";

import { useState } from "react";

const TestPage = () => {
  const [selectedID, setSelectedID] = useState(1);

  return (
    <>
      <main className="py-28 flex flex-col">
        {/* grid */}
        <div className="grid grid-cols-2 w-full gap-5">
          {
            Array(5).fill().map((_, i) => (
              <motion.div
                onClick={() => {
                  setSelectedID(i)
                }}
                layoutId={`item-${i}`}
                className="h-[150px] bg-base-300 p-5 rounded-btn">
                <motion.p
                layoutId={`item-${i}-text`}
                className="text-lg">Item {i}</motion.p>
              </motion.div>
            ))
          }
        </div>

        {/* modal */}
        <AnimatePresence>
          {
            selectedID !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedID(null);
                  }
                }}
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
              >
                <motion.div
                  layoutId={`item-${selectedID}`}
                  className="w-full max-w-lg bg-base-100 p-5"
                >
                  <motion.p
                  className="text-2xl"
                  layoutId={`item-${selectedID}-text`}
                  >Item {selectedID}</motion.p>
                </motion.div>
              </motion.div>
            )
          }
        </AnimatePresence>
      </main>
    </>
  );
};

export default TestPage;
