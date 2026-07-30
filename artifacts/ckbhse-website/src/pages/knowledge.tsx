import { Redirect } from 'wouter';

/** Backward-compatible redirect from legacy /knowledge URL. */
export default function Knowledge() {
  return <Redirect to="/resources" />;
}
