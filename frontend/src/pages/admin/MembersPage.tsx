import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircleRounded,
  DownloadRounded,
  FilterListRounded,
  GroupRounded,
  HourglassTopRounded,
  PersonSearchRounded,
  UploadRounded,
  VisibilityRounded,
  BlockRounded,
} from '@mui/icons-material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import {
  approveMember,
  exportMembers,
  getMembers,
  getPendingMembers,
  importMembers,
  rejectMember,
} from '../../services/api'
import type { Member } from '../../types/api'

type MemberTab = 'all' | 'pending'
type StatusFilter = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'
type ConfirmAction = 'approve' | 'reject'

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
}

function getStatus(member: Member) {
  return member.registrationStatus || (member.verified ? 'APPROVED' : 'PENDING')
}

function matchesQuery(member: Member, query: string) {
  const search = query.trim().toLowerCase()

  if (!search) return true

  return [
    member.fullName,
    member.mobileNumber,
    member.groceryCardNumber,
    member.liquorCardNumber,
    member.registrationStatus,
    String(member.id),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search))
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [activeTab, setActiveTab] = useState<MemberTab>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const loadMembers = async () => {
    setLoading(true)
    setError('')

    try {
      const [membersResponse, pendingResponse] = await Promise.all([
        getMembers(),
        getPendingMembers(),
      ])

      setMembers(membersResponse.data || [])
      setPendingMembers(pendingResponse.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || err.message || 'Unable to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const counts = useMemo(() => {
    const approved = members.filter((member) => getStatus(member) === 'APPROVED').length
    const pending = pendingMembers.length
    const rejected = members.filter((member) => getStatus(member) === 'REJECTED').length

    return {
      total: members.length,
      approved,
      pending,
      rejected,
    }
  }, [members, pendingMembers])

  const visibleRows = useMemo(() => {
    const source = activeTab === 'pending' ? pendingMembers : members

    return source.filter((member) => {
      const status = getStatus(member)
      const statusMatches = statusFilter === 'ALL' || status === statusFilter

      return statusMatches && matchesQuery(member, query)
    })
  }, [activeTab, members, pendingMembers, query, statusFilter])

  const handleImport = async (file: File) => {
    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      await importMembers(file)
      await loadMembers()
      setSuccess('Members imported successfully.')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || err.message || 'Import failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExport = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await exportMembers()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'members.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)
      setSuccess('Members export started.')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Export failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecision = async () => {
    if (!selectedMember || !confirmAction) return

    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      if (confirmAction === 'approve') {
        await approveMember(selectedMember.id)
        setSuccess(`${selectedMember.fullName} approved successfully.`)
      } else {
        await rejectMember(selectedMember.id)
        setSuccess(`${selectedMember.fullName} rejected successfully.`)
      }

      setConfirmAction(null)
      setSelectedMember(null)
      await loadMembers()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || err.message || 'Unable to update registration.')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<Member>[] = [
    {
      field: 'id',
      headerName: 'Member No.',
      width: 120,
      renderCell: ({ row }) => (
        <Typography fontWeight={800} color="#102319">
          #{row.id}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
      minWidth: 210,
      renderCell: ({ row }) => (
        <Box>
          <Typography fontWeight={800}>{row.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.mobileNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mobileNumber',
      headerName: 'Mobile',
      minWidth: 150,
    },
    {
      field: 'groceryCardNumber',
      headerName: 'Grocery Card',
      minWidth: 160,
      valueGetter: (_, row) => row.groceryCardNumber || 'Not registered',
    },
    {
      field: 'liquorCardNumber',
      headerName: 'Liquor Card',
      minWidth: 160,
      valueGetter: (_, row) => row.liquorCardNumber || 'Not registered',
    },
    {
      field: 'registrationStatus',
      headerName: 'Status',
      width: 140,
      renderCell: ({ row }) => {
        const status = getStatus(row)

        return <Chip size="small" label={status} color={statusColor[status] ?? 'default'} />
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 260,
      renderCell: ({ row }) => {
        const status = getStatus(row)
        const canReview = status === 'PENDING'

        return (
          <Stack direction="row" spacing={0.8}>
            <Button size="small" variant="outlined" startIcon={<VisibilityRounded />} onClick={() => setSelectedMember(row)}>
              View
            </Button>
            {canReview && (
              <>
                <Button
                  size="small"
                  color="success"
                  variant="contained"
                  onClick={() => {
                    setSelectedMember(row)
                    setConfirmAction('approve')
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setSelectedMember(row)
                    setConfirmAction('reject')
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </Stack>
        )
      },
    },
  ]

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
        >
          <Box>
            <Chip label="Customer approvals" color="success" variant="outlined" sx={{ mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 850, color: '#102319', lineHeight: 1.05 }}>
              Members & Registrations
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16 }}>
              Review pending customer registrations and maintain the approved member directory.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button variant="outlined" startIcon={<UploadRounded />} onClick={() => fileRef.current?.click()}>
              Import Excel
            </Button>
            <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleExport}>
              Export Excel
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) {
                  handleImport(file)
                }
              }}
            />
          </Stack>
        </Stack>

        {(loading || actionLoading) && <LinearProgress color="success" sx={{ borderRadius: 99 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={2}>
          {[
            { label: 'Total Members', value: counts.total, icon: GroupRounded, color: '#2E7D32' },
            { label: 'Approved', value: counts.approved, icon: CheckCircleRounded, color: '#1B5E20' },
            { label: 'Pending Review', value: counts.pending, icon: HourglassTopRounded, color: '#C9A227' },
            { label: 'Rejected', value: counts.rejected, icon: BlockRounded, color: '#B42318' },
          ].map((item) => {
            const Icon = item.icon

            return (
              <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 16px 40px rgba(15,23,42,0.07)' }}>
                  <CardContent sx={{ p: 2.6 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                          {item.label}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 850, color: '#102319' }}>
                          {loading ? <Skeleton width={70} /> : item.value.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: `${item.color}14`,
                          color: item.color,
                        }}
                      >
                        <Icon />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} spacing={2}>
                <Tabs value={activeTab} onChange={(_, value: MemberTab) => setActiveTab(value)} textColor="primary" indicatorColor="primary">
                  <Tab value="pending" label={`Pending (${counts.pending})`} />
                  <Tab value="all" label={`Directory (${counts.total})`} />
                </Tabs>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.4}>
                  <TextField
                    label="Search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    size="small"
                    sx={{ minWidth: { md: 300 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonSearchRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    label="Status"
                    size="small"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    sx={{ minWidth: 180 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListRounded />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="ALL">All statuses</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </TextField>
                </Stack>
              </Stack>

              <Box sx={{ height: 560, width: '100%' }}>
                <DataGrid
                  rows={visibleRows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  loading={loading}
                  disableRowSelectionOnClick
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                        page: 0,
                      },
                    },
                  }}
                  sx={{
                    border: '1px solid rgba(17,24,39,0.08)',
                    borderRadius: 3,
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#F8FAF8',
                    },
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                      outline: 'none',
                    },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={selectedMember != null && confirmAction == null} onClose={() => setSelectedMember(null)} fullWidth maxWidth="sm">
        <DialogTitle>Member Details</DialogTitle>
        <DialogContent>
          {selectedMember && <MemberDetails member={selectedMember} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMember(null)}>Close</Button>
          {selectedMember && getStatus(selectedMember) === 'PENDING' && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setConfirmAction('reject')}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => setConfirmAction('approve')}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={selectedMember != null && confirmAction != null} onClose={() => setConfirmAction(null)} fullWidth maxWidth="xs">
        <DialogTitle>{confirmAction === 'approve' ? 'Approve Registration' : 'Reject Registration'}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {confirmAction === 'approve'
              ? `Approve ${selectedMember?.fullName}? This customer will be allowed to login.`
              : `Reject ${selectedMember?.fullName}? This customer will remain inactive.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            color={confirmAction === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading}
            onClick={handleDecision}
          >
            {confirmAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function MemberDetails({ member }: { member: Member }) {
  const status = getStatus(member)

  return (
    <Stack spacing={2.2} sx={{ pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={850}>
            {member.fullName}
          </Typography>
          <Typography color="text.secondary">Member #{member.id}</Typography>
        </Box>
        <Chip label={status} color={statusColor[status] ?? 'default'} />
      </Stack>

      <Divider />

      <Grid container spacing={1.5}>
        {[
          ['Mobile', member.mobileNumber],
          ['Date of Birth', member.dateOfBirth || 'Not captured'],
          ['Grocery Card', member.groceryCardNumber || 'Not registered'],
          ['Liquor Card', member.liquorCardNumber || 'Not registered'],
          ['Email', 'Not captured by current registration form'],
          ['Registration Date', 'Not captured by current backend'],
        ].map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px solid rgba(17,24,39,0.06)' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {label}
              </Typography>
              <Typography fontWeight={800}>{value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
