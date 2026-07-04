import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { DownloadRounded, UploadRounded, AddRounded } from '@mui/icons-material'
import { useEffect, useState, useRef } from 'react'
import { getMembers, importMembers, exportMembers } from '../../services/api'
import type { Member } from '../../types/api'

const columns: GridColDef[] = [
  { field: 'fullName', headerName: 'Name', width: 220 },
  { field: 'rank', headerName: 'Rank', width: 140 },
  { field: 'unit', headerName: 'Unit', width: 200 },
  { field: 'mobileNumber', headerName: 'Phone', width: 160 },
  { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <Chip label={value as string} color={value === 'ACTIVE' ? 'success' : 'warning'} /> },
]

export default function MembersPage() {
  const [rows, setRows] = useState<Member[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const load = async (q = '') => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMembers(q)
      setRows(res.data || [])
    } catch (e: any) {
      setError(e?.response?.data || e.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Members Directory</Typography>
          <Typography color="text.secondary">Manage verified service members and service records.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="outlined" startIcon={<UploadRounded />}>Import Excel</Button>
          <Button variant="outlined" startIcon={<DownloadRounded />}>Export Excel</Button>
          <Button variant="contained" startIcon={<AddRounded />}>Add Member</Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <TextField label="Search members" size="small" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ width: { xs: '100%', md: 320 } }} />
            <Button variant="outlined" onClick={() => load(query)}>Search</Button>
            <Button variant="outlined" startIcon={<UploadRounded />} onClick={() => fileRef.current?.click()}>Import Excel</Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                setLoading(true)
                await importMembers(f)
                await load()
              } catch (err) {
                setError((err as any)?.response?.data || (err as any)?.message || 'Import failed')
              } finally { setLoading(false) }
            }} />
            <Button variant="outlined" startIcon={<DownloadRounded />} onClick={async () => {
              try {
                setLoading(true)
                const res = await exportMembers()
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const a = document.createElement('a')
                a.href = url
                a.download = 'members.xlsx'
                a.click()
                window.URL.revokeObjectURL(url)
              } catch (err) { setError((err as any)?.message || 'Export failed') } finally { setLoading(false) }
            }}>Export Excel</Button>
          </Stack>
          <Box sx={{ height: 420, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} loading={loading} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }} />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
