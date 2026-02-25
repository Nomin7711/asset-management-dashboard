import { useState } from "react";
import {
  Outlet,
  NavLink,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

const DRAWER_WIDTH = 240;

const mainNavItems = [{ label: "Home", to: "/", icon: <HomeRoundedIcon /> }];

interface LayoutProps {
  mode: "light" | "dark";
  onToggleMode: () => void;
}

function getPathLabel(pathname: string): string {
  if (pathname === "/" || pathname === "") return "Home";
  return pathname.split("/").filter(Boolean).join(" / ");
}

export function Layout({ mode, onToggleMode }: LayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const pathLabel = getPathLabel(pathname);

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.paper",
      }}
    >
      <Toolbar
        component={RouterLink}
        to="/"
        sx={{
          px: 2,
          py: 2,
          textDecoration: "none",
          color: "inherit",
          display: "block",
          cursor: "pointer",
          height: "64px",
          "&:hover": { bgcolor: "action.hover" },
        }}
        onClick={() => !isDesktop && setMobileOpen(false)}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Asset Management
        </Typography>
      </Toolbar>
      <List sx={{ px: 1, py: 1 }}>
        {mainNavItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            onClick={() => !isDesktop && setMobileOpen(false)}
            selected={pathname === item.to}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(74, 124, 89, 0.12)",
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(74, 124, 89, 0.18)" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1, minHeight: 24 }} />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: isDesktop ? DRAWER_WIDTH : "auto",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: 0,
            ...(isDesktop && {
              position: "fixed",
              height: "100vh",
              overflow: "hidden",
              flexDirection: "column",
              display: "flex",
            }),
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          backgroundColor: "background.paper",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            px: 2,
            py: 1,
            minHeight: "64px",
            flexShrink: 0,
            backgroundColor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            {!isDesktop && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                size="medium"
                sx={{ flexShrink: 0 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="body1" fontWeight={500} color="text.secondary" noWrap>
              {pathLabel}
            </Typography>
          </Box>
          <IconButton
            onClick={onToggleMode}
            aria-label={
              mode === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            color="primary"
            size="small"
          >
            {mode === "light" ? (
              <DarkModeRoundedIcon fontSize="small" />
            ) : (
              <LightModeRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            backgroundColor: "background.default",
            borderRadius: { xs: 0, sm: 4 },
            mx: { xs: 0, sm: 2 },
            mb: { xs: 0, sm: 2 },
            mt: { xs: 0, sm: 1 },
            p: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
