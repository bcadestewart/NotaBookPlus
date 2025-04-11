import React from "react";
import {
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Box,
} from "@mui/material";

export default function Settings({ darkMode, setDarkMode }) {
  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" gutterBottom>
          Adjust your preferences below.
        </Typography>

        <Box mt={3}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={handleToggle} />}
            label="Dark Mode"
          />
        </Box>
      </Paper>
    </Container>
  );
}
