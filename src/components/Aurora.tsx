/**
 * Site-wide fire-gradient atmosphere: three slow-drifting radial lights behind the content, plus a fixed film grain.
 * Pure CSS (transform-only animation, no blur filters). Section tone shifts are driven by <Motion /> via --a1..--a3.
 */
export function Aurora() {
  return (
    <>
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
