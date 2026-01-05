import { relations } from 'drizzle-orm';
import { mps, mpAssistants, mpTrips, mpStats, votes, billSponsors, bills, committeeMembers, accountabilityFlags } from './schema';

export const mpsRelations = relations(mps, ({ many }) => ({
	assistants: many(mpAssistants),
	trips: many(mpTrips),
  stats: many(mpStats),
  votes: many(votes),
  sponsoredBills: many(billSponsors),
  committeeMemberships: many(committeeMembers),
  accountabilityFlags: many(accountabilityFlags),
}));

export const mpAssistantsRelations = relations(mpAssistants, ({ one }) => ({
	mp: one(mps, {
		fields: [mpAssistants.mpId],
		references: [mps.id],
	}),
}));

export const mpTripsRelations = relations(mpTrips, ({ one }) => ({
  mp: one(mps, {
    fields: [mpTrips.mpId],
    references: [mps.id],
  }),
}));

export const mpStatsRelations = relations(mpStats, ({ one }) => ({
  mp: one(mps, {
    fields: [mpStats.mpId],
    references: [mps.id],
  }),
}));

export const billsRelations = relations(bills, ({ many }) => ({
  sponsors: many(billSponsors),
  votes: many(votes),
}));

export const billSponsorsRelations = relations(billSponsors, ({ one }) => ({
  bill: one(bills, {
    fields: [billSponsors.billId],
    references: [bills.id],
  }),
  mp: one(mps, {
    fields: [billSponsors.mpId],
    references: [mps.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  bill: one(bills, {
    fields: [votes.billId],
    references: [bills.id],
  }),
  mp: one(mps, {
    fields: [votes.mpId],
    references: [mps.id],
  }),
}));
