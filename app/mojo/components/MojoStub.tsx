export default function MojoStub({ heading, body }: { heading: string; body: string }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', color: 'var(--gold)', margin: '0 0 10px' }}>
        {heading}
      </h1>
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--mist)', margin: 0 }}>
        {body}
      </p>
    </div>
  )
}
