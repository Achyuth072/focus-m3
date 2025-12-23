'use client';

import { Fab } from '@mui/material';
import { motion } from 'framer-motion';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

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
        <AddRoundedIcon sx={{ fontSize: '32px' }} />
      </Fab>
    </motion.div>
  );
}
