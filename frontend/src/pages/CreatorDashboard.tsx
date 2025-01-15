import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/router';
import { courses } from '../lib/api';
import toast from 'react-hot-toast';

export default function CreatorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const { data: createdCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['createdCourses'],
    queryFn: courses.getCreated,
    onError: () => {
      toast.error('Failed to fetch created courses');
    },
  });

  const { data: courseUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['courseUsers', selectedCourse],
    queryFn: () => selectedCourse ? courses.getUsers(selectedCourse) : null,
    enabled: !!selectedCourse,
    onError: () => {
      toast.error('Failed to fetch course users');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ courseId, userId }: { courseId: number; userId: number }) =>
      courses.invite(courseId, userId),
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setInviteEmail('');
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: ({ courseId, userId }: { courseId: number; userId: number }) =>
      courses.removeUser(courseId, userId),
    onSuccess: () => {
      toast.success('User removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove user');
    },
  });

  if (coursesLoading) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <Link
            to="/creator/courses/new"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Create New Course
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">My Created Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {createdCourses?.map((course) => (
                <div
                  key={course.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer ${
                    selectedCourse === course.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                </div>
              ))}
            </div>
            {(!createdCourses || createdCourses.length === 0) && (
              <p className="text-gray-600">You haven't created any courses yet.</p>
            )}
          </div>

          {selectedCourse && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Users</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Invite User</h3>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="User email"
                    className="flex-1 rounded-md border-gray-300"
                  />
                  <button
                    onClick={() => {
                      if (selectedCourse && inviteEmail) {
                        inviteMutation.mutate({
                          courseId: selectedCourse,
                          userId: parseInt(inviteEmail), // This should be changed to handle email-to-user-id lookup
                        });
                      }
                    }}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    Invite
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className="space-y-4">
                  {courseUsers?.map((user) => (
                    <div key={user.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedCourse) {
                            removeUserMutation.mutate({
                              courseId: selectedCourse,
                              userId: user.id,
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!courseUsers || courseUsers.length === 0) && (
                    <p className="text-gray-600">No users enrolled in this course yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}