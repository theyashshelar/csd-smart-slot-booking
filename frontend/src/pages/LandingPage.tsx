import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import AccessPortal from '../components/landing/AccessPortal'
import AvailabilitySection from '../components/landing/AvailabilitySection'
import FAQSection from '../components/landing/FAQSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import FooterCTA from '../components/landing/FooterCTA'
import HeroSection from '../components/landing/HeroSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import { getLandingData } from '../services/api'
import type { LandingPageResponse } from '../types/api'

export type LandingTotals = {
  capacity: number
  booked: number
  available: number
  activeSlots: number
}

export default function LandingPage() {
  const [data, setData] = useState<LandingPageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getLandingData()
      .then((response) => {
        if (mounted) {
          setData(response.data)
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Live availability could not be loaded. Please try again shortly.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const totals = useMemo<LandingTotals>(() => {
    const slots = data?.availableSlots ?? []
    const capacity = slots.reduce((sum, slot) => sum + slot.capacity, 0)
    const booked = slots.reduce((sum, slot) => sum + slot.bookedCount, 0)

    return {
      capacity,
      booked,
      available: Math.max(capacity - booked, 0),
      activeSlots: slots.length,
    }
  }, [data])

  return (
    <Box
      sx={{
        position: 'relative',
        left: '50%',
        width: '100vw',
        ml: '-50vw',
        mt: { xs: -2, md: -4 },
        overflowX: 'clip',
        bgcolor: '#FFFFFF',
      }}
    >
      {loading && <LinearProgress color="success" />}

      {error && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

      <HeroSection data={data} totals={totals} loading={loading} />
      <AccessPortal />
      <AvailabilitySection data={data} totals={totals} loading={loading} />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <FooterCTA />
    </Box>
  )
}
