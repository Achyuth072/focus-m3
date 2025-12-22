'use client';

import { Fab } from '@mui/material';
import { motion } from 'framer-motion';

const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

interface AddTaskFabProps {
  onClick: () => void;
  layoutId?: string;
}

export default function AddTaskFab({ onClick, layoutId = 'add-task-fab' }: AddTaskFabProps) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{
        position: 'fixed',
        bottom: 100,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Fab
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        color="primary"
        aria-label="Add task"
        onClick={onClick}
        sx={{
          width: 64,
          height: 64,
        }}
      >
        <AddIcon />
      </Fab>
    </motion.div>
  );
}
