import type { Metadata } from 'next';
import SalesAcademy from './SalesAcademy';

export const metadata: Metadata = {
  title: 'Academy — BIZZ.IA Sales Academy',
};

export default function AcademyPage() {
  return <SalesAcademy />;
}
