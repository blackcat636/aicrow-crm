"use client"
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserById } from '@/lib/api/users';
import { UserDetail } from '@/interface/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IconArrowLeft, 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar,
  IconShield,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await getUserById(Number(userId));
        
        if ((response.status === 0 || response.status === 200) && response.data) {
          setUser(response.data);
        } else {
          setError(response.message || 'Error loading user');
        }
      } catch (err) {
        console.error('❌ Error fetching user:', err);
        setError('Error loading user');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/users">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                {user.photo ? (
                  <div className="relative w-24 h-24">
                    <Image
                      src={user.photo}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      className="w-full h-full bg-gray-200 rounded-full items-center justify-center text-gray-500 text-xs hidden"
                    >
                      No photo
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <IconUser className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">ID:</span>
                  <p className="text-lg font-semibold">{user.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">UUID:</span>
                  <p className="text-sm font-mono">{user.uuid}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Username:</span>
                  <p className="text-lg">{user.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Full name:</span>
                  <p className="text-lg">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Role:</span>
                  <div className="mt-1">
                    <Badge 
                      variant={user.role === "admin" ? "default" : "outline"}
                      className="text-sm"
                    >
                      <IconShield className="h-3 w-3 mr-1" />
                      {user.role === "admin" ? "Administrator" : "User"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-sm">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {user.isEmailVerified ? (
                        <IconCheck className="h-3 w-3 text-green-500" />
                      ) : (
                        <IconX className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {user.isEmailVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <p className="text-sm">{user.phone || 'Not specified'}</p>
                  </div>
                </div>

                {user.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Date of birth:</span>
                      <p className="text-sm">
                        {new Date(user.dateOfBirth).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Referral System */}
          <Card>
            <CardHeader>
              <CardTitle>Referral System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Referral code:</span>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded text-black">{user.referralCode || 'Not set'}</p>
                </div>
                
                {user.referredByCode && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Invited by code:</span>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded text-black">{user.referredByCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCalendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Updated:</span>
                  <p className="text-sm">
                    {new Date(user.updatedAt).toLocaleString('uk-UA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
