import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Box,
  Pagination,
  Typography,
  Chip,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { Asset } from "@/api/types";
import { capitalize } from "@/utils/string";
const STATUS_ALL = "all";

const ROWS_PER_PAGE = 10;

type Order = "asc" | "desc";
type AssetSortKey = keyof Asset;

interface AssetListProps {
  assets: Asset[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
  onViewDetails?: (id: string) => void;
}

const statusColor: Record<
  string,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  operational: "success",
  standby: "primary",
  maintenance: "warning",
  default: "default",
};

function matchesSearch(asset: Asset, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return (
    asset.name.toLowerCase().includes(q) ||
    asset.type.toLowerCase().includes(q) ||
    asset.location.toLowerCase().includes(q) ||
    asset.status.toLowerCase().includes(q) ||
    asset.id.toLowerCase().includes(q)
  );
}

function compareAssets(
  a: Asset,
  b: Asset,
  orderBy: AssetSortKey,
  order: Order,
): number {
  const aVal = a[orderBy];
  const bVal = b[orderBy];
  if (aVal === bVal) return 0;
  const cmp =
    typeof aVal === "string" && typeof bVal === "string"
      ? aVal.localeCompare(bVal, undefined, { numeric: true })
      : String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
  return order === "asc" ? cmp : -cmp;
}

const COLUMNS: {
  id: AssetSortKey | "details";
  label: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
}[] = [
  { id: "details", label: "", align: "center", sortable: false },
  { id: "name", label: "Name" },
  { id: "type", label: "Type" },
  { id: "location", label: "Location" },
  { id: "status", label: "Status" },
  { id: "last_updated", label: "Last updated" },
];

function formatLastUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function getStatusOptions(assets: Asset[]): string[] {
  const set = new Set(assets.map((a) => a.status).filter(Boolean));
  return [STATUS_ALL, ...Array.from(set).sort()];
}

export function AssetList({
  assets,
  onSelect,
  selectedId,
  onViewDetails,
}: AssetListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<AssetSortKey>("name");

  const statusOptions = useMemo(() => getStatusOptions(assets), [assets]);

  const filteredByStatus = useMemo(
    () =>
      statusFilter === STATUS_ALL
        ? assets
        : assets.filter((a) => a.status === statusFilter),
    [assets, statusFilter],
  );

  const filteredAssets = useMemo(
    () => filteredByStatus.filter((a) => matchesSearch(a, search)),
    [filteredByStatus, search],
  );

  const sortedAssets = useMemo(
    () =>
      [...filteredAssets].sort((a, b) => compareAssets(a, b, orderBy, order)),
    [filteredAssets, orderBy, order],
  );

  const pageCount = Math.max(1, Math.ceil(sortedAssets.length / ROWS_PER_PAGE));
  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedAssets.slice(start, start + ROWS_PER_PAGE);
  }, [sortedAssets, page]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRequestSort = (property: AssetSortKey) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const handleStatusChange = (_: React.SyntheticEvent, value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  if (assets.length === 0) {
    return <Typography color="text.secondary">No assets available.</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <Tabs
          value={statusFilter}
          onChange={handleStatusChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            flex: 1,
            "& .MuiTabs-indicator": { display: "none !important" },
            "& .MuiTabs-flexContainer": { gap: 0 },
            "& .MuiTab-root": {
              minHeight: 40,
              py: 0,
              textTransform: "none",
              borderRadius: 2,
              outline: "none",
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            },
            "& .Mui-selected": {
              bgcolor: "action.selected",
              borderRadius: 2,
              color: "text.primary",
              fontWeight: 600,
              outline: "none",
              boxShadow: "none",
              border: "none",
            },
          }}
        >
          {statusOptions.map((status) => (
            <Tab
              key={status}
              label={status === STATUS_ALL ? "All" : capitalize(status)}
              value={status}
            />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: 220,
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: 9999,
              bgcolor: "action.hover",
              "&:hover": { bgcolor: "action.selected" },
              "&.Mui-focused": { bgcolor: "background.paper" },
            },
          }}
        />
      </Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
          <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sortDirection={
                    col.sortable !== false && orderBy === col.id
                      ? order
                      : false
                  }
                  sx={{ fontWeight: 600, bgcolor: "action.hover" }}
                >
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() =>
                        handleRequestSort(col.id as AssetSortKey)
                      }
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAssets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography color="text.secondary">
                    No assets match &quot;{search}&quot;
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  hover
                  selected={selectedId === asset.id}
                  sx={{
                    cursor: "pointer",
                    "&:last-child td": { border: 0 },
                    ...(selectedId === asset.id && {
                      bgcolor: "action.selected",
                    }),
                  }}
                  onClick={() => onSelect(asset.id)}
                >
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {onViewDetails && (
                      <IconButton
                        size="small"
                        aria-label="View asset details"
                        color="primary"
                        onClick={() => onViewDetails(asset.id)}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{capitalize(asset.type)}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={capitalize(asset.status)}
                      variant="outlined"
                      color={statusColor[asset.status] ?? statusColor.default}
                    />
                  </TableCell>
                  <TableCell>{formatLastUpdated(asset.last_updated)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {sortedAssets.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mt: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {(page - 1) * ROWS_PER_PAGE + 1}–
            {Math.min(page * ROWS_PER_PAGE, sortedAssets.length)} of{" "}
            {sortedAssets.length}
            {search.trim() ? " (filtered)" : ""}
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            size="small"
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
