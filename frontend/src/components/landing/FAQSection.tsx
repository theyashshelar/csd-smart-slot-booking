import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const faqs = [
  {
    question: 'Can guests book a slot?',
    answer: 'No. Slot booking is available only after customer login for approved members.',
  },
  {
    question: 'Where does availability come from?',
    answer: 'The landing page reads live slot capacity and booking counts from the existing backend landing API.',
  },
  {
    question: 'When is the QR shown?',
    answer: 'The QR appears only after a booking is confirmed and the backend returns the booking token.',
  },
  {
    question: 'Can I track a booking without signing in?',
    answer: 'Yes. The public tracking page remains available for checking booking status by mobile number.',
  },
]

export default function FAQSection() {
  return (
    <Box component="section" id="faq" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#F8FAF8' }}>
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.4}>
              <Chip label="FAQ" color="secondary" variant="outlined" sx={{ width: 'fit-content' }} />
              <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
                Common questions.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
                Clear rules for login, booking, availability, QR tokens, and tracking.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={1.5}>
              {faqs.map((item) => (
                <Accordion
                  key={item.question}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(17,24,39,0.08)',
                    borderRadius: '18px !important',
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                    <Typography fontWeight={850}>{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
