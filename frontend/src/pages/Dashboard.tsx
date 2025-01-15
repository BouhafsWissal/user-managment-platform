import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { courses, invites } from '../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: courses.getEnrolled,
    onError: () => {
      toast.error('Failed to fetch enrolled courses');
    },
  });

  const { data: pendingInvites, isLoading: invitesLoading } = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: invites.getPending,
    onError: () => {
      toast.error('Failed to fetch invites');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: courses.leave,
    onSuccess: () => {
      toast.success('Left course successfully');
    },
    onError: () => {
      toast.error('Failed to leave course');
    },
  });

  const respondToInviteMutation = useMutation({
    mutationFn: ({ inviteId, accept }: { inviteId: number; accept: boolean }) =>
      invites.respond(inviteId, accept),
    onSuccess: () => {
      toast.success('Response sent successfully');
    },
    onError: () => {
      toast.error('Failed to respond to invite');
    },
  });

  if (coursesLoading || invitesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
        
        {pendingInvites && pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Invites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">{invite.course.title}</h3>
                  <p className="text-gray-600 mb-4">From: {invite.creator.name}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => respondToInviteMutation.mutate({ inviteId: invite.id, accept: true })}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInviteMutation.mutate({ inviteId: invite.id, accept: false })}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">My Enrolled Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses?.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => leaveMutation.mutate(course.id)}
                  className="text-red-600 hover:text-red-500"
                >
                  Leave Course
                </button>
              </div>
            </div>
          ))}
        </div>
        {(!enrolledCourses || enrolledCourses.length === 0) && (
          <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
        )}
      </div>
    </div>
  );
}