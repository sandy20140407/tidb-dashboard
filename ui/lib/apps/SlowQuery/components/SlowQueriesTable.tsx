import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardTableV2, ICardTableV2Props } from '@lib/components'
import { SlowqueryBase } from '@lib/client'
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList'
import * as useColumn from '@lib/utils/useColumn'

import * as useSlowQueryColumn from '../utils/useColumn'
import DetailPage from '../pages/Detail'

function tableColumns(
  rows: SlowqueryBase[],
  onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => void,
  orderBy: string,
  desc: boolean,
  showFullSQL?: boolean
): IColumn[] {
  return [
    useSlowQueryColumn.useSqlColumn(rows, showFullSQL),
    useSlowQueryColumn.useDigestColumn(rows),
    useSlowQueryColumn.useInstanceColumn(rows),
    useSlowQueryColumn.useDBColumn(rows),
    useSlowQueryColumn.useSuccessColumn(rows),
    {
      ...useSlowQueryColumn.useTimestampColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    {
      ...useSlowQueryColumn.useQueryTimeColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    {
      ...useSlowQueryColumn.useParseTimeColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    {
      ...useSlowQueryColumn.useCompileTimeColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    {
      ...useSlowQueryColumn.useProcessTimeColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    {
      ...useSlowQueryColumn.useMemoryColumn(rows, orderBy, desc),
      onColumnClick: onColumnClick,
    },
    useSlowQueryColumn.useTxnStartTsColumn(rows),
    useColumn.useDummyColumn(),
  ]
}

interface Props extends Partial<ICardTableV2Props> {
  loading: boolean
  slowQueries: SlowqueryBase[]

  orderBy: string
  desc: boolean
  showFullSQL?: boolean

  onChangeSort: (orderBy: string, desc: boolean) => void
  onGetColumns?: (columns: IColumn[]) => void
}

export default function SlowQueriesTable({
  loading,
  slowQueries,

  orderBy,
  desc,
  showFullSQL,

  onChangeSort,
  onGetColumns,
  ...restProps
}: Props) {
  const navigate = useNavigate()

  const columns = tableColumns(
    slowQueries,
    onColumnClick,
    orderBy,
    desc,
    showFullSQL
  )

  useEffect(() => {
    onGetColumns && onGetColumns(columns)
    // eslint-disable-next-line
  }, [])

  function onColumnClick(_ev: React.MouseEvent<HTMLElement>, column: IColumn) {
    if (column.key === orderBy) {
      onChangeSort(orderBy, !desc)
    } else {
      onChangeSort(column.key, true)
    }
  }

  function handleRowClick(rec) {
    const qs = DetailPage.buildQuery({
      digest: rec.digest,
      connectId: rec.connection_id,
      time: rec.timestamp,
    })
    navigate(`/slow_query/detail?${qs}`)
  }

  return (
    <CardTableV2
      loading={loading}
      columns={columns}
      onRowClicked={handleRowClick}
      {...restProps}
      items={slowQueries}
    />
  )
}
