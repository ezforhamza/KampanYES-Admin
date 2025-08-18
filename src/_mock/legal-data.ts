export interface LegalPage {
	id: string;
	type: 'terms' | 'privacy';
	title: string;
	content: string;
	lastUpdated: Date;
	updatedBy: string;
}

export const MOCK_LEGAL_PAGES: LegalPage[] = [
	{
		id: "terms-and-conditions",
		type: "terms",
		title: "Terms and Conditions",
		content: `
			<h1>Terms and Conditions</h1>
			<p>Welcome to KampanYES. By using our platform, you agree to these terms and conditions.</p>
			
			<h2>1. Acceptance of Terms</h2>
			<p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
			
			<h2>2. Use License</h2>
			<p>Permission is granted to temporarily download one copy of the materials on KampanYES for personal, non-commercial transitory viewing only.</p>
			
			<h2>3. Disclaimer</h2>
			<p>The materials on KampanYES are provided on an 'as is' basis. KampanYES makes no warranties, expressed or implied.</p>
			
			<h2>4. Contact Information</h2>
			<p>If you have any questions about these Terms and Conditions, please contact us.</p>
		`,
		lastUpdated: new Date('2024-01-15T10:00:00Z'),
		updatedBy: "admin"
	},
	{
		id: "privacy-policy",
		type: "privacy",
		title: "Privacy Policy",
		content: `
			<h1>Privacy Policy</h1>
			<p>Your privacy is important to us. This Privacy Policy explains how KampanYES collects, uses, and protects your information.</p>
			
			<h2>1. Information We Collect</h2>
			<p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
			
			<h2>2. How We Use Your Information</h2>
			<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
			
			<h2>3. Information Sharing</h2>
			<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
			
			<h2>4. Data Security</h2>
			<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
			
			<h2>5. Contact Us</h2>
			<p>If you have any questions about this Privacy Policy, please contact us at privacy@kampanyes.com</p>
		`,
		lastUpdated: new Date('2024-01-15T10:00:00Z'),
		updatedBy: "admin"
	}
];

export const getLegalPageById = (id: string): LegalPage | undefined => {
	return MOCK_LEGAL_PAGES.find(page => page.id === id);
};

export const getLegalPageByType = (type: 'terms' | 'privacy'): LegalPage | undefined => {
	return MOCK_LEGAL_PAGES.find(page => page.type === type);
};

export const updateLegalPage = (id: string, content: string): LegalPage | null => {
	const pageIndex = MOCK_LEGAL_PAGES.findIndex(page => page.id === id);
	if (pageIndex === -1) return null;
	
	MOCK_LEGAL_PAGES[pageIndex] = {
		...MOCK_LEGAL_PAGES[pageIndex],
		content,
		lastUpdated: new Date(),
		updatedBy: "admin"
	};
	
	return MOCK_LEGAL_PAGES[pageIndex];
};