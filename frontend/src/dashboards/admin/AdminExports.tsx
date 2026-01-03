import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Check, X, Globe, Package, User } from 'lucide-react';

interface AdminExportsProps {
    exportApplications: any[];
    handleExportAction: (id: number, action: 'approve' | 'reject') => void;
    getStatusColor: (status: string) => string;
}

const AdminExports: React.FC<AdminExportsProps> = ({
    exportApplications, handleExportAction, getStatusColor
}) => {
    return (
        <Card className="w-full shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Export Applications
                        <Badge variant="secondary" className="ml-2">
                            {exportApplications.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Manage and review international export requests from farmers.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Farmer Info</TableHead>
                                <TableHead>Cargo Details</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exportApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No export applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                exportApplications.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold flex items-center gap-1">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {e.farmerName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{e.farmerEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-green-600" />
                                                    {e.cropDetails}
                                                </div>
                                                <Badge variant="outline" className="w-fit">
                                                    {e.quantity} kg
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{e.destinationCountry}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(e.status)}>
                                                {e.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {e.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleExportAction(e.id, 'approve')}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleExportAction(e.id, 'reject')}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    {e.adminNotes ? `Note: ${e.adminNotes}` : 'No notes'}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminExports;
